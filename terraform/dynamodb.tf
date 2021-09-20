

resource "aws_dynamodb_table" "projects" {
  name = "${var.dynamodb_table_name_prefix}${var.dynamodb_table_name_projects}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "Slug"

  attribute {
    name = "Slug"
    type = "S"
  }
}
