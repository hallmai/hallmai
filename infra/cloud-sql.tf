resource "google_sql_database_instance" "main" {
  name                = "hallmai-db"
  database_version    = "POSTGRES_17"
  region              = var.region
  deletion_protection = true

  depends_on = [google_service_networking_connection.private_vpc]

  settings {
    tier              = var.db_tier
    edition           = "ENTERPRISE"
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled    = true
      private_network = google_compute_network.vpc.id

      # 로컬 개발용 — Cloud SQL Auth Proxy는 SSL 인증으로 보호됨
      authorized_networks {
        name  = "cloud-sql-proxy"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
    }

    disk_size = 10
    disk_type = "PD_SSD"
  }
}

resource "google_sql_database" "hallmai" {
  name     = "hallmai"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = "hallmai-app"
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}
