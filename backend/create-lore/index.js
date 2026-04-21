import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const tableName = process.env.TABLE_NAME;
        
        // API Gateway'den gelen JSON string'i objeye çevir
        let body = {};
        if (event.body) {
            body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        }

        // Yeni lore (bilgi) için rastgele ID oluştur
        const loreId = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        
        // Item objesi oluştur (DynamoDB'ye kaydedilecek veri)
        const item = {
            // Partition Key (PK) ve Sort Key (SK) - Single Table Design
            PK: `USER#${body.userId || 'DEFAULT_USER'}`,
            SK: `LORE#${loreId}`,
            
            // İstediğimiz diğer tüm attributeları ekleyebiliriz
            id: loreId,
            title: body.title || "İsimsiz Lore",
            description: body.description || "",
            type: body.type || "universe", // ör: universe, character, timeline
            createdAt: timestamp,
            updatedAt: timestamp
        };

        // Veriyi kaydetme komutu
        const command = new PutCommand({
            TableName: tableName,
            Item: item,
        });

        await docClient.send(command);

        // Başarılı yanıt (CORS headerlarıyla birlikte)
        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST",
            },
            body: JSON.stringify({
                message: "Lore başarıyla eklendi!",
                item: item
            })
        };
    } catch (error) {
        console.error("Lore eklenirken hata oluştu:", error);
        
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ 
                error: "Bir sunucu hatası oluştu.", 
                details: error.message 
            })
        };
    }
};
