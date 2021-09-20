

resource "aws_iam_role" "brandonslade-me-api-role" {
  name = "${var.lambda_name_prefix}-api-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowLambda"
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {
    name = "${var.lambda_name_prefix}-api-policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Sid = "CloudWatchCreateLogGroup"
          Effect = "Allow"
          Action = "logs:CreateLogGroup"
          Resource = "arn:aws:logs:${var.region}:${var.account_id}:*"
        },
        {
          Sid = "CloudWatchSendLogs"
          Effect = "Allow"
          Action = [
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ]
          Resource = [
            "arn:aws:logs:${var.region}:${var.account_id}:log-group:/aws/lambda/${var.lambda_name_prefix}-api:*"
          ]
        },
        {
          Sid = "DynamoDBRead"
          Effect = "Allow"
          Action = [
            "dynamodb:Scan"
          ]
          Resource = [
            "${aws_dynamodb_table.projects.arn}/index/*",
            "${aws_dynamodb_table.projects.arn}"
          ]
        }
      ]
    })
  }
}

resource "aws_lambda_function" "brandonslade-me-api" {
  function_name = "${var.lambda_name_prefix}-api"
  # current role: arn:aws:iam::060232771263:role/service-role/brandonslade-me-api-role-c9kz6bws
  role = aws_iam_role.brandonslade-me-api-role.arn
  package_type = "Image"
  memory_size = 128
  timeout = 10

  # TODO: don't hardcode
  image_uri = "${var.account_id}.dkr.ecr.${var.region}.amazonaws.com/brandonslade.me/api@sha256:7d95e36f41994fe2ba72c1f54f7dc8f31a3e24a453ac5288a4375c9fd237a9e3"
}
