variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast3"
}

variable "db_tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-f1-micro"
}

variable "backend_image" {
  description = "Backend container image URL"
  type        = string
  default     = ""
}

variable "cors_origin" {
  description = "Allowed CORS origins (comma-separated)"
  type        = string
  default     = "http://localhost:3000"
}
