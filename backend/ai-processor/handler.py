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
  "relationships": [{"sourceEntityName": "", "targetEntityName": "", "relation": "friend|enemy|neutral"}],
  "summary": "Genel özet"
}
Notunda bahsedilmeyen kategorileri boş liste olarak bırak."""


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

            # 1. Bedrock çağrısı
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
            ai_text = result['content'][0]['text']
            parsed = json.loads(ai_text)

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


def _merge_into_state(parsed_data, user_id, universe_id):
    """Mevcut USER#/STATE#CURRENT blob'una AI çıktısını merge eder."""
    timestamp = datetime.utcnow().isoformat()

    # 1. Mevcut state'i oku
    response = table.get_item(
        Key={'PK': f'USER#{user_id}', 'SK': 'STATE#CURRENT'}
    )
    current_state = response.get('Item', {}).get('state', {})

    existing_entities = current_state.get('entities', [])
    existing_connections = current_state.get('connections', [])

    # Entity name → id mapping (ilişkilerde kullanmak için)
    name_to_id = {}

    # 2. Yeni entity'leri ekle
    for category in ['characters', 'locations', 'events']:
        for entity in parsed_data.get(category, []):
            entity_id = str(uuid4())
            name_to_id[entity.get('name', '')] = entity_id
            existing_entities.append({
                'id': entity_id,
                'universeId': universe_id,
                'name': entity.get('name', ''),
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
        source_id = name_to_id.get(source_name, source_name)
        target_id = name_to_id.get(target_name, target_name)

        if source_id and target_id:
            rel_id = str(uuid4())
            existing_connections.append({
                'id': rel_id,
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
