terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "random_pet" "resource_suffix" {
  prefix = "mavarra-main-web"
  length = 2
}

data "aws_caller_identity" "current" {}

locals {
  secret_names = distinct([
    var.jwt_secret_name,
    var.mongodb_uri_secret_name,
    var.mongodb_db_secret_name
  ])

  secret_arns = [
    for name in local.secret_names : format(
      "arn:aws:secretsmanager:%s:%s:secret:%s-*",
      var.aws_region,
      data.aws_caller_identity.current.account_id,
      name
    )
  ]

  resource_prefix       = random_pet.resource_suffix.id
  security_group_name   = "${local.resource_prefix}-sg"
  iam_role_name         = "${local.resource_prefix}-role"
  iam_policy_name       = "${local.resource_prefix}-secrets-policy"
  instance_profile_name = "${local.resource_prefix}-instance-profile"
  instance_name_tag     = local.resource_prefix
}

resource "aws_security_group" "mavarra_sg" {
  name        = local.security_group_name
  description = "Security group for the Mavarra web stack"

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = local.security_group_name
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "secrets_access" {
  statement {
    sid     = "ReadRuntimeSecrets"
    actions = ["secretsmanager:GetSecretValue"]
    effect  = "Allow"

    resources = local.secret_arns
  }
}

resource "aws_iam_role" "instance" {
  name               = local.iam_role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "secrets" {
  name   = local.iam_policy_name
  role   = aws_iam_role.instance.id
  policy = data.aws_iam_policy_document.secrets_access.json
}

resource "aws_iam_instance_profile" "instance" {
  name = local.instance_profile_name
  role = aws_iam_role.instance.name
}

resource "aws_instance" "mavarra_app" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.mavarra_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.instance.name

  user_data = templatefile("${path.module}/user_data.sh", {
    aws_region              = var.aws_region
    node_env                = var.node_env
    jwt_secret_name         = var.jwt_secret_name
    mongodb_uri_secret_name = var.mongodb_uri_secret_name
    mongodb_db_secret_name  = var.mongodb_db_secret_name
    container_image         = var.container_image
    container_name          = var.container_name
    host_port               = var.host_port
    container_port          = var.container_port
    ghcr_username           = var.ghcr_username
    ghcr_token_secret_name  = var.ghcr_token_secret_name
    auth_issuer             = var.auth_issuer
    app_base_url            = var.app_base_url
  })

  user_data_replace_on_change = true

  tags = {
    Name = local.instance_name_tag
  }
}
