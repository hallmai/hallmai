# DB password — auto-generated, stored in Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "hallmai-db-password"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# JWT secret — must be set manually: gcloud secrets versions add hallmai-jwt-secret --data-file=-
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "hallmai-jwt-secret"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = "CHANGE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Gemini API key — must be set manually
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "hallmai-gemini-api-key"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "gemini_api_key" {
  secret      = google_secret_manager_secret.gemini_api_key.id
  secret_data = "CHANGE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Google OAuth Client ID — must be set manually
resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "hallmai-google-client-id"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "google_client_id" {
  secret      = google_secret_manager_secret.google_client_id.id
  secret_data = "CHANGE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Google OAuth Client Secret — must be set manually
resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "hallmai-google-client-secret"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "google_client_secret" {
  secret      = google_secret_manager_secret.google_client_secret.id
  secret_data = "CHANGE_ME"

  lifecycle {
    ignore_changes = [secret_data]
  }
}
