include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../module/Firewall"
}

inputs = {
  name          = "allow-port-8000"
  network       = "default"
  protocol      = "tcp"
  ports         = ["8000"]
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "https-server"]
}