import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='eu-central-1')
table = dynamodb.Table('lorekeeper-prod-entities')

USER_ID = '3384f8d2-60d1-70d4-05ba-e35913aabd19'

# Mevcut state'i oku
response = table.get_item(
    Key={'PK': f'USER#{USER_ID}', 'SK': 'STATE#CURRENT'}
)
item = response.get('Item', {})
state = item.get('state', {})
entities = state.get('entities', [])
connections = state.get('connections', [])

# Entity'lerden varsayılan universeId'yi bul
default_universe_id = None
if entities:
    default_universe_id = entities[0].get('universeId')

if not default_universe_id:
    print("Hata: Entity'lerde universeId bulunamadı.")
    exit(1)

print(f"Kullanılacak Universe ID: {default_universe_id}")

updated = 0
for conn in connections:
    if 'universeId' not in conn:
        conn['universeId'] = default_universe_id
        updated += 1
        print(f"Güncelleniyor: {conn.get('id')}")

if updated > 0:
    state['connections'] = connections
    table.put_item(Item={
        'PK': f'USER#{USER_ID}',
        'SK': 'STATE#CURRENT',
        'state': state,
        'updatedAt': item.get('updatedAt', ''),
    })
    print(f"\n{updated} bağlantıya universeId eklendi ve kaydedildi!")
else:
    print("\nTüm bağlantılarda zaten universeId mevcut.")
