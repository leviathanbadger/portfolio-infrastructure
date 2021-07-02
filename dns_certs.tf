

resource "aws_route53_zone" "brandonslade-me" {
  name = var.site_domain_name
  comment = "Personal portfolio"
  force_destroy = true
}

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
