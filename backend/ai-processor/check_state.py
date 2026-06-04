import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='eu-central-1')
table = dynamodb.Table('lorekeeper-prod-entities')

USER_ID = '3384f8d2-60d1-70d4-05ba-e35913aabd19'

response = table.get_item(
    Key={'PK': f'USER#{USER_ID}', 'SK': 'STATE#CURRENT'}
)
state = response.get('Item', {}).get('state', {})
entities = state.get('entities', [])
connections = state.get('connections', [])

id_to_name = {e['id']: e.get('name', '?') for e in entities}

print(f"Entities ({len(entities)}):")
for e in entities:
    print(f"  [{e.get('type', '?')}] {e.get('name', '?')} (links: {e.get('linkCount', 0)}) id: {e['id'][:8]}")

print(f"\nConnections ({len(connections)}):")
for c in connections:
    src = id_to_name.get(c['sourceId'], f"ORPHAN:{c['sourceId'][:8]}")
    tgt = id_to_name.get(c['targetId'], f"ORPHAN:{c['targetId'][:8]}")
    print(f"  {src} --[{c.get('relation', '?')}]--> {tgt}")
