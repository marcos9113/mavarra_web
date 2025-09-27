variable "aws_region" {
  description = "AWS region used for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance size for the dev stack"
  type        = string
  default     = "t3.small"
}

variable "ami_id" {
  description = "AMI ID used for the application instance"
  type        = string
  default     = "ami-02d26659fd82cf299"
}

variable "key_name" {
  description = "Existing EC2 key pair for SSH access"
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "List of CIDR blocks that may reach the instance over SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_env" {
  description = "NODE_ENV assigned to the application"
  type        = string
  default     = "production"
}

variable "container_image" {
  description = "Fully-qualified container image (e.g. ghcr.io/org/mavarra:latest)"
  type        = string
}

variable "container_name" {
  description = "Container name used by systemd service"
  type        = string
  default     = "mavarra"
}

variable "host_port" {
  description = "Host port exposed by the EC2 instance"
  type        = number
  default     = 80
}

variable "container_port" {
  description = "Port exposed by the container image"
  type        = number
  default     = 8080
}

variable "ghcr_username" {
  description = "Username used for authenticating to the container registry (optional)"
  type        = string
  default     = ""
}

variable "ghcr_token_secret_name" {
  description = "Secrets Manager name containing a registry access token (optional)"
  type        = string
  default     = ""
}

variable "auth_issuer" {
  description = "Issuer value used when generating TOTP otpauth URIs"
  type        = string
  default     = "Mavarra"
}

variable "app_base_url" {
  description = "Base URL used to construct invite links"
  type        = string
  default     = ""
}

variable "jwt_secret_name" {
  description = "AWS Secrets Manager name for the JWT secret"
  type        = string
  default     = "mavarra/jwt_secret"
}

variable "mongodb_uri_secret_name" {
  description = "AWS Secrets Manager name for the MongoDB connection string"
  type        = string
  default     = "mavarra/mongodb_uri"
}

variable "mongodb_db_secret_name" {
  description = "AWS Secrets Manager name for the MongoDB database name"
  type        = string
  default     = "mavarra/mongodb_db"
}
