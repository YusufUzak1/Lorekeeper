"""
Tek seferlik temizleme scripti:
- Duplike entity'leri siler (aynı isimden ilk olanı tutar)
- Orphan bağlantıları (silinen entity ID'lerine ait) temizler
- Eski duplike entity ID'lerine ait bağlantıları doğru ID'ye yönlendirir
"""
import boto3
import json
from collections import defaultdict

dynamodb = boto3.resource('dynamodb', region_name='eu-central-1')
table = dynamodb.Table('lorekeeper-prod-entities')

USER_ID = '3384f8d2-60d1-70d4-05ba-e35913aabd19'

# 1. Mevcut state'i oku
response = table.get_item(
    Key={'PK': f'USER#{USER_ID}', 'SK': 'STATE#CURRENT'}
)
item = response.get('Item', {})
state = item.get('state', {})
entities = state.get('entities', [])
connections = state.get('connections', [])

print(f"Toplam entity: {len(entities)}")
print(f"Toplam connection: {len(connections)}")

# 2. Entity'leri isim bazında grupla
name_groups = defaultdict(list)
for ent in entities:
    name_groups[ent.get('name', '').lower()].append(ent)

# Duplike olanları bul
old_to_new_id = {}  # eski duplike ID -> doğru (ilk) ID
kept_entities = []
for name_lower, group in name_groups.items():
    # İlk entity'yi tut, gerisini sil
    keeper = group[0]
    kept_entities.append(keeper)
    for dup in group[1:]:
        old_to_new_id[dup['id']] = keeper['id']
        print(f"  DUPLİKE SİLİNİYOR: '{dup.get('name')}' (id: {dup['id'][:8]}... -> {keeper['id'][:8]}...)")

print(f"\nSilinen duplike: {len(old_to_new_id)}")
print(f"Kalan entity: {len(kept_entities)}")

# 3. Bağlantıları düzelt
valid_ids = {e['id'] for e in kept_entities}
fixed_connections = []
seen_pairs = set()

for conn in connections:
    src = conn.get('sourceId', '')
    tgt = conn.get('targetId', '')
    
    # Eski ID'leri yenileriyle değiştir
    src = old_to_new_id.get(src, src)
    tgt = old_to_new_id.get(tgt, tgt)
    
    # Her iki ID de geçerli mi?
    if src not in valid_ids or tgt not in valid_ids:
        print(f"  ORPHAN BAĞLANTI SİLİNİYOR: {src[:8]}... -> {tgt[:8]}...")
        continue
    
    # Aynı çift tekrar eklenmemeli
    pair = (src, tgt)
    if pair in seen_pairs:
        print(f"  DUPLİKE BAĞLANTI SİLİNİYOR: {src[:8]}... -> {tgt[:8]}...")
        continue
    seen_pairs.add(pair)
    
    conn['sourceId'] = src
    conn['targetId'] = tgt
    fixed_connections.append(conn)

print(f"\nEski bağlantı sayısı: {len(connections)}")
print(f"Temizlenmiş bağlantı sayısı: {len(fixed_connections)}")

# 4. linkCount'ları yeniden hesapla
link_count = defaultdict(int)
for conn in fixed_connections:
    link_count[conn['sourceId']] += 1
    link_count[conn['targetId']] += 1

for ent in kept_entities:
    ent['linkCount'] = link_count.get(ent['id'], 0)

# 5. Güncellenmiş state'i yaz
state['entities'] = kept_entities
state['connections'] = fixed_connections

table.put_item(Item={
    'PK': f'USER#{USER_ID}',
    'SK': 'STATE#CURRENT',
    'state': state,
    'updatedAt': item.get('updatedAt', ''),
})

print("\n✅ DynamoDB state temizlendi ve güncellendi!")

# Özet
print("\n--- ÖZET ---")
for ent in kept_entities:
    print(f"  {ent.get('type', '?'):10s} | {ent.get('name', '?'):20s} | bağlantı: {ent.get('linkCount', 0)}")
print(f"\nBağlantılar:")
for conn in fixed_connections:
    # İsimleri bul
    id_to_name = {e['id']: e.get('name', '?') for e in kept_entities}
    src_name = id_to_name.get(conn['sourceId'], '?')
    tgt_name = id_to_name.get(conn['targetId'], '?')
    print(f"  {src_name} --[{conn.get('relation', '?')}]--> {tgt_name}")
