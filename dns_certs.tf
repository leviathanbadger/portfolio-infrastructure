

resource "aws_route53_zone" "brandonslade-me" {
  name = var.site_domain_name
  comment = "Personal portfolio"
  force_destroy = true
}



resource "aws_acm_certificate" "cert" {
  domain_name = var.site_domain_name
  validation_method = "DNS"

  subject_alternative_names = [
    "www.${var.site_domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name = dvo.resource_record_name
      record = dvo.resource_record_value
      type = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.brandonslade-me.zone_id
  name = each.value.name
  ttl = 60
  records = [each.value.record]
  type = each.value.type
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# aws_acm_certificate_validation.cert_validation.certificate_arn



resource "aws_route53_record" "root_a" {
  zone_id = aws_route53_zone.brandonslade-me.zone_id
  name = var.site_domain_name
  type = "A"

  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.brandonslade-me.domain_name
    zone_id = aws_cloudfront_distribution.brandonslade-me.hosted_zone_id
  }
}

resource "aws_route53_record" "root_aaaa" {
  zone_id = aws_route53_zone.brandonslade-me.zone_id
  name = var.site_domain_name
  type = "AAAA"

  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.brandonslade-me.domain_name
    zone_id = aws_cloudfront_distribution.brandonslade-me.hosted_zone_id
  }
}

resource "aws_route53_record" "www_a" {
  zone_id = aws_route53_zone.brandonslade-me.zone_id
  name = "www.${var.site_domain_name}"
  type = "A"

  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.www-brandonslade-me.domain_name
    zone_id = aws_cloudfront_distribution.www-brandonslade-me.hosted_zone_id
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = aws_route53_zone.brandonslade-me.zone_id
  name = "www.${var.site_domain_name}"
  type = "AAAA"

  alias {
    evaluate_target_health = false
    name = aws_cloudfront_distribution.www-brandonslade-me.domain_name
    zone_id = aws_cloudfront_distribution.www-brandonslade-me.hosted_zone_id
  }
}
