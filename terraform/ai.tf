# ============================================================
# 7. AI ENGINE — SQS + Bedrock Lambda (AI Processor)
# ============================================================

# ── SQS Kuyrukları ──

resource "aws_sqs_queue" "lore_synthesis_dlq" {
  name                      = "${var.project_name}-${var.environment}-lore-synthesis-dlq"
  message_retention_seconds = 1209600 # 14 gün
}

resource "aws_sqs_queue" "lore_synthesis" {
  name                       = "${var.project_name}-${var.environment}-lore-synthesis"
  visibility_timeout_seconds = 300
  message_retention_seconds  = 86400 # 24 saat

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.lore_synthesis_dlq.arn
    maxReceiveCount     = 3
  })
}

# ── Python Lambda Zip ──

data "archive_file" "ai_processor_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/ai-processor"
  output_path = "${path.module}/ai-processor.zip"
}

# ── AI Lambda IAM Rolü ──

resource "aws_iam_role" "ai_lambda_exec" {
  name = "${var.project_name}-${var.environment}-ai-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# AI Lambda İzin Politikası (Bedrock + SQS + DynamoDB)
resource "aws_iam_policy" "ai_lambda_policy" {
  name = "${var.project_name}-${var.environment}-ai-lambda-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "BedrockInvoke"
        Effect   = "Allow"
        Action   = ["bedrock:InvokeModel"]
        Resource = [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
          "arn:aws:bedrock:eu-central-1:${data.aws_caller_identity.current.account_id}:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0"
        ]
      },
      {
        Sid    = "SQSRead"
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.lore_synthesis.arn
      },
      {
        Sid    = "DynamoDBAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = aws_dynamodb_table.entities.arn
      }
    ]
  })
}

# Yardımcı: Account ID almak için
data "aws_caller_identity" "current" {}

# Policy Attachments
resource "aws_iam_role_policy_attachment" "ai_lambda_basic" {
  role       = aws_iam_role.ai_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "ai_lambda_policy_attach" {
  role       = aws_iam_role.ai_lambda_exec.name
  policy_arn = aws_iam_policy.ai_lambda_policy.arn
}

# ── Python Lambda Fonksiyonu ──

resource "aws_lambda_function" "ai_processor" {
  filename         = data.archive_file.ai_processor_zip.output_path
  source_code_hash = data.archive_file.ai_processor_zip.output_base64sha256
  function_name    = "${var.project_name}-${var.environment}-ai-processor"
  role             = aws_iam_role.ai_lambda_exec.arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  timeout          = 300
  memory_size      = 512

  environment {
    variables = {
      TABLE_NAME       = aws_dynamodb_table.entities.name
      BEDROCK_MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
      AWS_REGION_NAME  = var.aws_region
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.ai_lambda_basic,
    aws_iam_role_policy_attachment.ai_lambda_policy_attach
  ]
}

# ── SQS → Lambda Bağlantısı ──

resource "aws_lambda_event_source_mapping" "sqs_to_ai" {
  event_source_arn = aws_sqs_queue.lore_synthesis.arn
  function_name    = aws_lambda_function.ai_processor.arn
  batch_size       = 1
  enabled          = true
}

# ── API Gateway → SQS IAM Rolü ──

resource "aws_iam_role" "api_gw_sqs" {
  name = "${var.project_name}-${var.environment}-apigw-sqs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "apigateway.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "api_gw_sqs_send" {
  role = aws_iam_role.api_gw_sqs.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sqs:SendMessage"]
      Resource = aws_sqs_queue.lore_synthesis.arn
    }]
  })
}
