variable "name" {
  description = "Name of the Compute Engine instance"
  type        = string
}

variable "machine_type" {
  description = "Machine type for the instance"
  type        = string
}

variable "zone" {
  description = "Zone for the instance"
  type        = string
}

variable "image" {
  description = "Image to use for the instance boot disk"
  type        = string
}

variable "network" {
  description = "Network for the instance"
  type        = string
}

variable "metadata_startup_script" {
  description = "Startup script for the instance"
  type        = string
}

variable "tags" {
  description = "Tags for the instance"
  type        = list(string)
}

variable "service_account_email" {
  description = "Service account email for the instance"
  type        = string
}

variable "service_account_scopes" {
  description = "Scopes for the service account"
  type        = list(string)
}