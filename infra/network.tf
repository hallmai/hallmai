# VPC for private Cloud Run ↔ Cloud SQL connectivity
resource "google_compute_network" "vpc" {
  name                    = "hallmai-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name          = "hallmai-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

# Private IP range for Cloud SQL
resource "google_compute_global_address" "private_ip" {
  name          = "hallmai-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id
}

# Private service connection for Cloud SQL
resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}

# VPC Access Connector for Cloud Run → Cloud SQL
resource "google_vpc_access_connector" "connector" {
  name           = "hallmai-connector"
  region         = var.region
  ip_cidr_range  = "10.8.0.0/28"
  network        = google_compute_network.vpc.name
  min_throughput = 200
  max_throughput = 300
}
