# ============================================================
# 6. LAMBDA — Backend API fonksiyonu (Phase 2)
# ============================================================

# Yazilan Node.js kodunu otomatik zip yap
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/create-lore"
  output_path = "${path.module}/create-lore.zip"
}

# Lambda'nin calismasi icin gereken temel rol
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-${var.environment}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Lambda'ya DynamoDB'ye veri yazma yetkisi
resource "aws_iam_policy" "lambda_dynamodb" {
  name = "${var.project_name}-${var.environment}-lambda-dynamodb-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem"
      ]
      Effect = "Allow"
      Resource = aws_dynamodb_table.entities.arn
    }]
  })
}

# AWS managed basic logging policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB yazma policy baglantisi
resource "aws_iam_role_policy_attachment" "lambda_dynamo_attach" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

# Lambda fonksiyonu
resource "aws_lambda_function" "create_lore" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name    = "${var.project_name}-${var.environment}-create-lore"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.entities.name
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_dynamo_attach
  ]
}
