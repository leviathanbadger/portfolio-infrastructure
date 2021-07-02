

locals {
  brandonslade-me-dist-origin-id = "S3-${aws_s3_bucket.brandonslade-me.id}/dist"
  brandonslade-me-assets-origin-id = "S3-${aws_s3_bucket.brandonslade-me.id}/assets"
  brandonslade-me-api-origin-id = "${var.site_domain_name}/api"
}

data "aws_cloudfront_cache_policy" "managed-cachingoptimized" {
  # id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "managed-cachingdisabled" {
  # id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  name = "Managed-CachingDisabled"
}

# TODO: add cert as resource

data "aws_acm_certificate" "brandonslade-me" {
  domain = "${var.site_domain_name}" # www.* should also be an "additional name" in the certificate
  types = ["AMAZON_ISSUED"]
  most_recent = true
}

resource "aws_cloudfront_distribution" "brandonslade-me" {
  enabled = true
  is_ipv6_enabled = true
  default_root_object = "index.html"
  aliases = [var.site_domain_name]
  price_class = "PriceClass_100"

  origin {
    domain_name = "${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com"
    origin_id = local.brandonslade-me-api-origin-id
    origin_path = "/prod"
    connection_attempts = 3
    connection_timeout = 3

    custom_origin_config {
      origin_ssl_protocols = ["TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_protocol_policy = "https-only"
      origin_read_timeout = 10
      origin_keepalive_timeout = 5
      http_port = 80
      https_port = 443
    }
  }

  origin {
    domain_name = aws_s3_bucket.brandonslade-me.bucket_regional_domain_name
    origin_id = local.brandonslade-me-dist-origin-id
    origin_path = "/dist"
    connection_attempts = 3
    connection_timeout = 3
  }

  origin {
    domain_name = aws_s3_bucket.brandonslade-me.bucket_regional_domain_name
    origin_id = local.brandonslade-me-assets-origin-id
    connection_attempts = 3
    connection_timeout = 3
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.brandonslade-me-dist-origin-id
    viewer_protocol_policy = "redirect-to-https"

    cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingoptimized.id
  }

  ordered_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.brandonslade-me-assets-origin-id
    viewer_protocol_policy = "redirect-to-https"
    path_pattern = "/assets/*"

    cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingoptimized.id
  }

  ordered_cache_behavior {
    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.brandonslade-me-api-origin-id
    viewer_protocol_policy = "redirect-to-https"
    path_pattern = "/api/*"

    cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingdisabled.id
  }

  custom_error_response {
    error_code = 403
    response_code = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.brandonslade-me.arn
    minimum_protocol_version = "TLSv1.2_2019"
    ssl_support_method = "sni-only"
  }
}

locals {
  www-brandonslade-me-origin-id = "S3-${aws_s3_bucket.brandonslade-me-www-redirect.id}"
}

resource "aws_cloudfront_distribution" "www-brandonslade-me" {
  enabled = true
  is_ipv6_enabled = true
  aliases = ["www.${var.site_domain_name}"]
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.brandonslade-me-www-redirect.website_endpoint
    origin_id = local.www-brandonslade-me-origin-id
    connection_attempts = 3
    connection_timeout = 3

    custom_origin_config {
      origin_ssl_protocols = ["TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_protocol_policy = "http-only"
      origin_read_timeout = 30
      origin_keepalive_timeout = 5
      http_port = 80
      https_port = 443
    }
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.www-brandonslade-me-origin-id
    viewer_protocol_policy = "allow-all" # don't redirect to https; the entire distribution redirects already, so it wastes time

    cache_policy_id = data.aws_cloudfront_cache_policy.managed-cachingoptimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.brandonslade-me.arn
    minimum_protocol_version = "TLSv1.2_2019"
    ssl_support_method = "sni-only"
  }
}
