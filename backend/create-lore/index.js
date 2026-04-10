'use strict';

const AWS = require('aws-sdk');
const crypto = require('crypto');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  try {
    if (!tableName) {
      return response(500, { error: 'TABLE_NAME environment variable is missing.' });
    }

    if (event.httpMethod === 'OPTIONS') {
      return response(200, { ok: true });
    }

    const payload = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const title = (payload.title || '').trim();
    const content = (payload.content || '').trim();
    const type = (payload.type || 'lore').trim().toLowerCase();

    if (!title) {
      return response(400, { error: 'title is required.' });
    }

    const now = new Date().toISOString();
    const id = `lore_${crypto.randomUUID()}`;
    const owner = event.requestContext?.authorizer?.jwt?.claims?.sub || 'anonymous';

    const item = {
      PK: `USER#${owner}`,
      SK: `LORE#${id}`,
      entityId: id,
      entityType: type,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise();

    return response(201, {
      message: 'Lore created.',
      item,
    });
  } catch (error) {
    console.error('create-lore error:', error);
    return response(500, {
      error: 'Internal server error.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
