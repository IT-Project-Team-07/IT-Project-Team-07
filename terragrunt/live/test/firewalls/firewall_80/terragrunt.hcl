include {
  path = find_in_parent_folders()
}

terraform {
  source = "../../../../module/Firewall"
}

inputs = {
  name          = "allow-port-80"
  network       = "default"
  protocol      = "tcp"
  ports         = ["80"]
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["http-server", "https-server"]
}