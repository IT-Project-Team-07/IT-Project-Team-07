locals {
  # Define the bucket name and project
  bucket_name = "mutualism-terraform-state"
  project     = "buzzwatch-422510"
  location    = "europe-west1"
}

inputs = {
  bucket_name = local.bucket_name
  project     = local.project
  location    = local.location
}

# Define the backend block after creating the bucket
generate "backend" {
  path      = "backend.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
terraform {
  backend "gcs" {
    bucket      = "${local.bucket_name}"
    prefix      = "${path_relative_to_include()}"
  }
}
EOF
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
    provider "google" { 
    project = "buzzwatch-422510"
    region  = "europe-west1-d"
    }
  EOF
}
