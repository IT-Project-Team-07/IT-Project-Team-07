variable "name" {
  description = "Name of the firewall rule"
  type        = string
}

variable "network" {
  description = "VPC network for the firewall rule"
  type        = string
}

variable "protocol" {
  description = "Protocol to allow (e.g., tcp, udp)"
  type        = string
}

variable "ports" {
  description = "Ports to allow for the specified protocol"
  type        = list(string)
}

variable "source_ranges" {
  description = "Source IP ranges to allow"
  type        = list(string)
}

variable "target_tags" {
  description = "Target tags to associate with the rule"
  type        = list(string)
}