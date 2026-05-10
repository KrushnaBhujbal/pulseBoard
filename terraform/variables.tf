variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for naming all resources"
  type        = string
  default     = "pulseboard"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}