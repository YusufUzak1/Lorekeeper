import boto3, json, decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal): return int(obj)
        return super(DecimalEncoder, self).default(obj)

table = boto3.resource('dynamodb', region_name='eu-central-1').Table('lorekeeper-prod-entities')
res = table.get_item(Key={'PK':'USER#3384f8d2-60d1-70d4-05ba-e35913aabd19', 'SK':'STATE#CURRENT'})
with open('db_state.json', 'w') as f: 
    json.dump(res.get('Item', {}).get('state', {}), f, cls=DecimalEncoder, indent=2)
