import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const tableName = process.env.TABLE_NAME;
        
        // Cognito JWT token'dan sub (user id) bilgisini çıkar
        // API Gateway HTTP API + JWT Authorizer genelde burada tutar:
        const claims = event.requestContext?.authorizer?.jwt?.claims;
        const userId = claims?.sub || 'DEFAULT_USER';
        
        const method = event.requestContext?.http?.method || event.httpMethod;

        // CORS Headerları
        const corsHeaders = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        };

        if (method === 'OPTIONS') {
            return { statusCode: 200, headers: corsHeaders, body: '' };
        }

        if (method === 'GET') {
            // Veritabanından durumu çek
            const getCommand = new GetCommand({
                TableName: tableName,
                Key: {
                    PK: `USER#${userId}`,
                    SK: `STATE#CURRENT`
                }
            });
            const { Item } = await docClient.send(getCommand);
            
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify(Item ? Item.state : null) // null ise henüz state yok demektir
            };
        } 
        
        if (method === 'POST') {
            // API Gateway'den gelen JSON string'i objeye çevir
            let body = {};
            if (event.body) {
                body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            }

            const timestamp = new Date().toISOString();
            
            // Tüm state'i tek bir kayıt olarak DynamoDB'ye kaydet
            const item = {
                PK: `USER#${userId}`,
                SK: `STATE#CURRENT`,
                state: body,
                updatedAt: timestamp
            };

            const putCommand = new PutCommand({
                TableName: tableName,
                Item: item,
            });

            await docClient.send(putCommand);

            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: "Store synced successfully!" })
            };
        }

        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ message: "Method Not Allowed" })
        };
        
    } catch (error) {
        console.error("Sync error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ 
                error: "Internal Server Error", 
                details: error.message 
            })
        };
    }
};
