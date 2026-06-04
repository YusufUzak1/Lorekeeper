# ============================================================
# Değişkenler (Variables)
# ============================================================

variable "project_name" {
  description = "Proje adı — kaynak isimlendirmede kullanılır"
  type        = string
  default     = "lorekeeper"
}

variable "environment" {
  description = "Ortam (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS bölgesi"
  type        = string
  default     = "eu-central-1" # Frankfurt — Türkiye'ye en yakın
}
