# ============================================================
# Lorekeeper — AWS Altyapısı (S3 + CloudFront)
# Ultra düşük maliyetli, serverless frontend hosting
# ============================================================

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # ── İsteğe bağlı: Terraform state'i S3'te tutmak isterseniz ──
  # backend "s3" {
  #   bucket = "lorekeeper-tf-state"
  #   key    = "infra/terraform.tfstate"
  #   region = "eu-central-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ============================================================
# 1. S3 BUCKET — Frontend statik dosyaları için
# ============================================================

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-${var.environment}-frontend"

  # Bucket'ı yanlışlıkla silmekten koruma (prod'da true yapın)
  force_destroy = true
}

# S3 public erişimi engelle — CloudFront üzerinden sunulacak
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning — geri dönüş imkânı için  
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# ============================================================
# 2. CLOUDFRONT — CDN + Ücretsiz HTTPS
# ============================================================

# CloudFront'un S3'e erişim izni (Origin Access Control)
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for Lorekeeper S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Lorekeeper Frontend CDN"
  price_class         = "PriceClass_100" # Sadece Kuzey Amerika + Avrupa (en ucuz)

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    # AWS Managed CachingOptimized policy
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # SPA routing — React Router tüm route'ları index.html'e yönlendir
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true # Ücretsiz *.cloudfront.net HTTPS
  }
}

# S3 Bucket Policy — Yalnızca CloudFront erişebilir
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# ============================================================
# 3. IAM — GitHub Actions deploy yetkisi
# ============================================================

resource "aws_iam_user" "github_deployer" {
  name = "${var.project_name}-github-deployer"
}

resource "aws_iam_access_key" "github_deployer" {
  user = aws_iam_user.github_deployer.name
}

resource "aws_iam_user_policy" "github_deployer" {
  name = "${var.project_name}-deploy-policy"
  user = aws_iam_user.github_deployer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DeployAccess"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.frontend.arn,
          "${aws_s3_bucket.frontend.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation"
        ]
        Resource = aws_cloudfront_distribution.frontend.arn
      }
    ]
  })
}

# ============================================================
# 4. COGNITO — Kullanıcı Kimlik Doğrulama (Kapı Görevlisi)
# ============================================================

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-users"

  # Sadece e-posta ile giriş
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  # Kullanıcıların kendi kaydolmasına izin ver
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Parola ilkeleri
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  # E-posta doğrulama mesajı
  verification_message_template {
    default_email_options {
      email_message = "Lorekeeper platformuna hoş geldiniz! Doğrulama kodunuz: {####}"
      email_subject = "Lorekeeper - E-posta Doğrulaması"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-user-pool"
  }
}

resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.project_name}-${var.environment}-frontend-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Client Secret web uygulamaları (SPA) için false olmalıdır
  generate_secret = false

  # Kimlik doğrulama akışları
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# ============================================================
# 5. DYNAMODB — Veritabanı (Kasa) - Single-Table Design
# ============================================================

resource "aws_dynamodb_table" "entities" {
  name         = "${var.project_name}-${var.environment}-entities"
  billing_mode = "PAY_PER_REQUEST" # İsteğe Bağlı Ödeme (ücretsiz katman dostu)

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-entities"
  }
}
