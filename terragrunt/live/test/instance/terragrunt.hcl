

include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../module/instance"
}

inputs = {
  name                   = "test-omgeving"
  machine_type           = "e2-medium"
  zone                   = "europe-west1-d"
  image                  = "debian-cloud/debian-11"
  network                = "default"
  metadata_startup_script = file("startup.sh")
  tags                   = ["http-server", "https-server"]
  service_account_email  = "docker-image@buzzwatch-422510.iam.gserviceaccount.com"
  service_account_scopes = ["https://www.googleapis.com/auth/cloud-platform"]
}