

resource "aws_api_gateway_rest_api" "api" {
  name = "${var.site_domain_name}/api"
  description = "API endpoints for ${var.site_domain_name}"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy_any" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = "ANY"
  authorization = "NONE"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "proxy_any_lambda" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.proxy.id
  http_method = aws_api_gateway_method.proxy_any.http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.brandonslade-me-api.invoke_arn

  cache_key_parameters = [
    "method.request.path.proxy"
  ]

  content_handling = "CONVERT_TO_TEXT"
}

resource "aws_api_gateway_deployment" "current" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.proxy.id,
      aws_api_gateway_method.proxy_any.id,
      aws_api_gateway_integration.proxy_any_lambda.id,
      # Additional resources, methods, and ingregrations need to be added here explicitly to get correct automated deployments
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.current.id
  stage_name = "prod"
  description = "Production environment"
  cache_cluster_size = "0.5"
}

# TODO: permission for API Gateway to access lambda function?
