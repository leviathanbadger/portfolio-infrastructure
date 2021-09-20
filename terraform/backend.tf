

terraform {
  backend "remote" {
    organization = "miniwit-studios"

    workspaces {
      name = "portfolio-prod"
    }
  }
}
