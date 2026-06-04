# ============================================================
# Çıktılar (Outputs)
# ============================================================

output "cloudfront_url" {
  description = "Sitenize bu URL üzerinden erişebilirsiniz"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront dağıtım ID'si (cache invalidation için)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_bucket_name" {
  description = "Frontend dosyalarının yüklendiği S3 bucket adı"
  value       = aws_s3_bucket.frontend.id
}

output "deployer_access_key_id" {
  description = "GitHub Actions için AWS Access Key ID"
  value       = aws_iam_access_key.github_deployer.id
  sensitive   = true
}

output "deployer_secret_access_key" {
  description = "GitHub Actions için AWS Secret Access Key"
  value       = aws_iam_access_key.github_deployer.secret
  sensitive   = true
}

output "cognito_user_pool_id" {
  description = "Kullanıcı Havuzu (User Pool) ID'si"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Frontend için App Client ID'si"
  value       = aws_cognito_user_pool_client.frontend.id
}

output "dynamodb_table_name" {
  description = "DynamoDB Tablo Adı (Varlıklar ve notlar için)"
  value       = aws_dynamodb_table.entities.id
}
