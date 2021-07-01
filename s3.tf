

resource "aws_s3_bucket" "brandonslade-me" {
  bucket = var.site_bucket_name
  acl = "private"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    id = "remove-previous-versions"
    enabled = true
    abort_incomplete_multipart_upload_days = 0

    noncurrent_version_expiration {
      days = 30
    }
  }

  server_side_encryption_configuration {
    rule {
      bucket_key_enabled = false
      
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_policy" "brandonslade-me" {
  bucket = aws_s3_bucket.brandonslade-me.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "PublicRead"
        Effect = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = [
          "${aws_s3_bucket.brandonslade-me.arn}/dist/*",
          "${aws_s3_bucket.brandonslade-me.arn}/assets/*"
        ]
      }
    ]
  })
}

resource "aws_s3_bucket" "brandonslade-me-www-redirect" {
  bucket = "${var.site_bucket_name}-www-redirect"
  acl = "private"

  versioning {
    enabled = true
  }

  website {
    redirect_all_requests_to = "https://${var.site_domain_name}"
  }

  lifecycle_rule {
    id = "remove-previous-versions"
    enabled = true
    abort_incomplete_multipart_upload_days = 0

    noncurrent_version_expiration {
      days = 30
    }
  }

  server_side_encryption_configuration {
    rule {
      bucket_key_enabled = false
      
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_policy" "brandonslade-me-www-redirect" {
  bucket = aws_s3_bucket.brandonslade-me-www-redirect.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "PublicRead"
        Effect = "Allow"
        Principal = "*"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${aws_s3_bucket.brandonslade-me-www-redirect.arn}/*"
      }
    ]
  })
}
