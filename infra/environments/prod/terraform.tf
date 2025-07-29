# Production Environment Terraform Configuration

terraform {
  required_version = ">= 1.5.0"

  # Production state should be stored remotely
  backend "s3" {
    bucket         = "letsfindmy-forge-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    
    # These can be overridden via backend config
    # terraform init -backend-config="bucket=my-bucket"
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    doppler = {
      source  = "DopplerHQ/doppler"
      version = "~> 1.2"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.1"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.0"
    }
  }
}