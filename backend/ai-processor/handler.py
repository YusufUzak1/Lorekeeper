import json
import boto3
import os
import logging
from datetime import datetime
from uuid import uuid4

logger = logging.getLogger()
logger.setLevel(logging.INFO)

bedrock = boto3.client('bedrock-runtime', region_name=os.environ['AWS_REGION_NAME'])
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

SYSTEM_PROMPT = """Sen bir dünya inşa asistanısın. Sana verilen serbest metin notunu analiz et ve 
aşağıdaki JSON formatında yanıt ver. Başka hiçbir şey yazma, sadece JSON döndür:
{
  "characters": [{"name": "", "type": "character", "description": "", "domains": [], "era": "", "status": "active"}],
  "locations": [{"name": "", "type": "place", "description": "", "domains": [], "era": "", "status": "active"}],
  "events": [{"name": "", "type": "event", "description": "", "domains": [], "era": "", "status": "active"}],
  "relationships": [{"sourceEntityName": "", "targetEntityName": "", "relation": "friend|enemy|neutral|located_in|involved_in|other"}],
  "summary": "Genel özet"
}
Notunda bahsedilmeyen kategorileri boş liste olarak bırak.
ÖNEMLİ: Metinde adı geçen TÜM karakterler, mekanlar ve olaylar arasındaki mantıksal bağlantıları (relationships dizisinde) mutlaka oluştur! Karakterlerin mekanlarla ve olaylarla olan ilişkilerini (located_in, involved_in vb.) de eklemeyi unutma. Mümkün olduğunca hiçbir varlığı bağlantısız bırakma."""


def lambda_handler(event, context):
    for record in event['Records']:
        try:
            body = json.loads(record['body'])
            note_text = body.get('noteText', '')
            user_id = body.get('userId', 'UNKNOWN')
            universe_id = body.get('universeId', 'DEFAULT')

            if not note_text:
                logger.warning("Boş not metni, atlanıyor")
                continue

            parsed = _synthesize(note_text)

            # 2. Mevcut state'e merge et (Option A: Blob Merge)
            _merge_into_state(parsed, user_id, universe_id)

            char_count = len(parsed.get('characters', []))
            loc_count = len(parsed.get('locations', []))
            evt_count = len(parsed.get('events', []))
            logger.info(
                f"İşlendi: userId={user_id}, "
                f"{char_count} karakter, {loc_count} mekan, {evt_count} olay"
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse hatası: {e}", exc_info=True)
            raise
        except Exception as e:
            logger.error(f"Hata: {e}", exc_info=True)
            raise  # SQS retry → sonunda DLQ'ya düşer


def call_bedrock(note_text):
    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2048,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": note_text}]
    }

    response = bedrock.invoke_model(
        modelId=os.environ['BEDROCK_MODEL_ID'],
        body=json.dumps(payload),
        contentType='application/json',
        accept='application/json'
    )

    result = json.loads(response['body'].read())
    return result['content'][0]['text']

def _invoke_groq(note_text):
    """B Planı: Bedrock çalışmazsa Groq API (Llama 3) üzerinden JSON üretir"""
    import os
    import urllib.request
    import urllib.error
    import json
    
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY çevre değişkeni bulunamadı.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {
                "role": "system", 
                "content": (
                    "You are a world-building assistant. Analyze the given free-text note and "
                    "respond ONLY with a JSON object in this exact format:\n"
                    "{\n"
                    '  "characters": [{"name": "", "type": "character", "description": "", "domains": [], "era": "", "status": "active"}],\n'
                    '  "locations": [{"name": "", "type": "place", "description": "", "domains": [], "era": "", "status": "active"}],\n'
                    '  "events": [{"name": "", "type": "event", "description": "", "domains": [], "era": "", "status": "active"}],\n'
                    '  "relationships": [{"sourceEntityName": "", "targetEntityName": "", "relation": "friend|enemy|neutral|located_in|involved_in|other"}],\n'
                    '  "summary": "Brief summary"\n'
                    "}\n"
                    "Leave categories as empty arrays if not mentioned in the note.\n"
                    "IMPORTANT: You MUST create logical relationships between ALL extracted entities in the 'relationships' array. Include connections between characters, locations, and events using appropriate relation types like 'located_in', 'involved_in', etc. Do not leave any entity unconnected.\n"
                    "Do not include any text outside the JSON."
                )
            },
            {
                "role": "user", 
                "content": note_text
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            response_data = json.loads(resp.read().decode("utf-8"))
            return response_data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        logger.error(f"Groq API HTTP {e.code} hatası. Detay: {error_body}")
        raise Exception(f"Groq API HTTP {e.code}: {error_body}")

def _synthesize(note_text):
    """Önce Bedrock'u dener, hata alırsa Groq API'ye geçer."""
    ai_text = None
    
    try:
        # 1. Ana Motor: Amazon Bedrock (Claude Haiku 4.5)
        logger.info("Bedrock (Claude) deneniyor...")
        ai_text = call_bedrock(note_text)
        
    except Exception as bedrock_err:
        logger.warning(f"Bedrock kotalı veya hata verdi. Groq API'ye geçiliyor... Hata: {bedrock_err}")
        
        # 2. Yedek Motor: Groq API (Llama 3 70B)
        try:
            ai_text = _invoke_groq(note_text)
        except Exception as groq_err:
            logger.error(f"Groq API de hata verdi: {groq_err}")
            raise groq_err

    # Yapay zekadan dönen metni JSON olarak parse et
    import json
    logger.info(f"AI Ham Yanıt: {ai_text[:500]}")
    try:
        # Markdown kod blokları (```json) varsa temizle
        clean_text = ai_text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        return json.loads(clean_text.strip())
    except Exception as parse_err:
        logger.error(f"Yapay zeka yanıtı JSON'a çevrilemedi: {parse_err}")
        logger.error(f"Gelen Ham Yanıt: {ai_text}")
        raise parse_err

def _merge_into_state(parsed_data, user_id, universe_id):
    """Mevcut USER#/STATE#CURRENT blob'una AI çıktısını merge eder."""
    timestamp = datetime.utcnow().isoformat()

    # 1. Mevcut state'i oku
    response = table.get_item(
        Key={'PK': f'USER#{user_id}', 'SK': 'STATE#CURRENT'}
    )
    current_state = response.get('Item', {}).get('state', {})

    # 2. SADECE bu evrene ait olan mevcut Entity'leri topla
    existing_entities = current_state.get('entities', [])
    existing_connections = current_state.get('connections', [])
    
    # name_to_id haritasını sadece aynı evrendeki entity'ler için oluştur
    name_to_id = {}
    for ent in existing_entities:
        if ent.get('universeId') == universe_id:
            name_to_id[ent.get('name', '').lower()] = ent['id']

    # 2. Yeni entity'leri ekle (aynı isimde varsa atla, yoksa oluştur)
    for category in ['characters', 'locations', 'events']:
        for entity in parsed_data.get(category, []):
            # Groq bazen string dizisi döndürebilir (["Aragorn"] vs [{"name":"Aragorn"}])
            if isinstance(entity, str):
                entity = {"name": entity, "type": category.rstrip('s'), "description": ""}
            
            entity_name = entity.get('name', '')
            
            # Aynı isimde entity zaten varsa yenisini oluşturma
            if entity_name.lower() in name_to_id:
                logger.info(f"Entity zaten mevcut, atlanıyor: {entity_name}")
                continue
            
            entity_id = str(uuid4())
            name_to_id[entity_name.lower()] = entity_id
            existing_entities.append({
                'id': entity_id,
                'universeId': universe_id,
                'name': entity_name,
                'type': entity.get('type', category.rstrip('s')),
                'description': entity.get('description', ''),
                'domains': entity.get('domains', []),
                'era': entity.get('era', ''),
                'status': entity.get('status', 'active'),
                'linkCount': 0,
            })

    # 3. İlişkileri ekle (name-based → id-based dönüşümle)
    for rel in parsed_data.get('relationships', []):
        source_name = rel.get('sourceEntityName', '')
        target_name = rel.get('targetEntityName', '')
        source_id = name_to_id.get(source_name.lower())
        target_id = name_to_id.get(target_name.lower())

        if source_id and target_id:
            # Aynı bağlantı zaten varsa tekrar ekleme
            already_exists = any(
                c.get('sourceId') == source_id and c.get('targetId') == target_id
                for c in existing_connections
            )
            if already_exists:
                logger.info(f"Bağlantı zaten mevcut: {source_name} → {target_name}")
                continue

            rel_id = str(uuid4())
            existing_connections.append({
                'id': rel_id,
                'universeId': universe_id,
                'sourceId': source_id,
                'targetId': target_id,
                'relation': rel.get('relation', 'neutral'),
            })

            # linkCount güncelle
            for ent in existing_entities:
                if ent['id'] in (source_id, target_id):
                    ent['linkCount'] = ent.get('linkCount', 0) + 1

    current_state['entities'] = existing_entities
    current_state['connections'] = existing_connections

    # 4. Güncellenmiş state'i geri yaz
    table.put_item(Item={
        'PK': f'USER#{user_id}',
        'SK': 'STATE#CURRENT',
        'state': current_state,
        'updatedAt': timestamp,
    })
