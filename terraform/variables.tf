

variable "access_key" {
  type = string
  sensitive = true
}

variable "secret_key" {
  type = string
  sensitive = true
}

variable "account_id" {
  type = string
  default = "060232771263"
}

variable "region" {
  type = string
  default = "us-east-1"
}

variable "site_bucket_name" {
  type = string
  default = "brandonslade-me"
}

variable "lambda_name_prefix" {
  type = string
  default = "brandonslade-me"
}

variable "site_domain_name" {
  type = string
  default = "brandonslade.me" # Also change default_tags.miniwitstudios:site
}

variable "default_tags" {
  type = map(string)
  default = {
    "miniwitstudios:managedby" = "terraform"
    "miniwitstudios:project" = "Portfolio site"
    "miniwitstudios:site" = "brandonslade.me"
  }
}

variable "dynamodb_table_name_prefix" {
  type = string
  default = "Portfolio"
}

variable "dynamodb_table_name_projects" {
  type = string
  default = "Projects"
}
