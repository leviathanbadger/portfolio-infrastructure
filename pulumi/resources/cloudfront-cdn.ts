import { output as pulumiOutput } from '@pulumi/pulumi';
import { cloudfront } from '@pulumi/aws';
import { siteDomainName, region } from '../util/config';
import { defaultTags } from '../util/default-tags';
import { apiGatewayProdStage, apiGatewayRestApi } from './api-gateway';
import { primaryBucket, wwwRedirectBucket } from './s3';
import { certificate, certificateValidation } from './dns-certs';

const managedCachingOptimizedPolicy = pulumiOutput(cloudfront.getCachePolicy({
  // id = '658327ea-f89d-4fab-a63d-7e88639e58f6'
  name: 'Managed-CachingOptimized'
}));

const managedCachingDisabledPolicy = pulumiOutput(cloudfront.getCachePolicy({
  // id = '4135ea2d-6df8-44a3-9df3-4b5a84be39ad'
  name: 'Managed-CachingDisabled'
}));

const distOriginId = primaryBucket.id.apply(bucketId => `S3-${bucketId}/dist`);
const assetsOriginId = primaryBucket.id.apply(bucketId => `S3-${bucketId}/assets`);
const apiOriginId = `${siteDomainName}/api`;

const primaryCloudfrontDistributionName = `cdn/${siteDomainName}`;
export const primaryCloudfrontDistribution = new cloudfront.Distribution(
  primaryCloudfrontDistributionName,
  {
    enabled: true,
    isIpv6Enabled: true,
    defaultRootObject: 'index.html',
    aliases: [siteDomainName],
    priceClass: 'PriceClass_100',

    tags: defaultTags,

    origins: [
      {
        domainName: apiGatewayRestApi.id.apply(apiId => `${apiId}.execute-api.${region}.amazonaws.com`),
        originId: apiOriginId,
        originPath: '/prod',
        connectionAttempts: 3,
        connectionTimeout: 3,

        customOriginConfig: {
          originSslProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
          originProtocolPolicy: 'https-only',
          originReadTimeout: 10,
          originKeepaliveTimeout: 5,
          httpPort: 80,
          httpsPort: 443
        }
      },
      {
        domainName: primaryBucket.bucketRegionalDomainName,
        originId: distOriginId,
        originPath: '/dist',
        connectionAttempts: 3,
        connectionTimeout: 3
      },
      {
        domainName: primaryBucket.bucketRegionalDomainName,
        originId: assetsOriginId,
        connectionAttempts: 3,
        connectionTimeout: 3
      }
    ],

    defaultCacheBehavior: {
      allowedMethods: ['GET', 'HEAD'],
      cachedMethods: ['GET', 'HEAD'],
      targetOriginId: distOriginId,
      viewerProtocolPolicy: 'redirect-to-https',

      cachePolicyId: managedCachingOptimizedPolicy.id!.apply(id => id!)
    },

    orderedCacheBehaviors: [
      {
        allowedMethods: ['GET', 'HEAD'],
        cachedMethods: ['GET', 'HEAD'],
        targetOriginId: assetsOriginId,
        viewerProtocolPolicy: 'redirect-to-https',
        pathPattern: '/assets/*',

        cachePolicyId: managedCachingOptimizedPolicy.id!.apply(id => id!)
      },
      {
        allowedMethods: ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'],
        cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
        targetOriginId: apiOriginId,
        viewerProtocolPolicy: 'redirect-to-https',
        pathPattern: '/api/*',

        cachePolicyId: managedCachingDisabledPolicy.id!.apply(id => id!)
      }
    ],

    customErrorResponses: [
      {
        errorCode: 403,
        responseCode: 200,
        responsePagePath: '/index.html',
        errorCachingMinTtl: 10
      },
      {
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html',
        errorCachingMinTtl: 10
      }
    ],

    restrictions: {
      geoRestriction: {
        restrictionType: 'none'
      }
    },

    viewerCertificate: {
      acmCertificateArn: certificateValidation.certificateArn,
      minimumProtocolVersion: 'TLSv1.2_2019',
      sslSupportMethod: 'sni-only'
    }
  },
  {
    dependsOn: [primaryBucket, apiGatewayRestApi, apiGatewayProdStage, certificate, certificateValidation]
  }
);

const wwwRedirectOriginId = wwwRedirectBucket.id.apply(bucketId => `S3-${bucketId}`);

const wwwRedirectCloudfrontDistributionName = `cdn/www.${siteDomainName}`;
export const wwwRedirectCloudfrontDistribution = new cloudfront.Distribution(
  wwwRedirectCloudfrontDistributionName,
  {
    enabled: true,
    isIpv6Enabled: true,
    aliases: [`www.${siteDomainName}`],
    priceClass: 'PriceClass_100',

    tags: defaultTags,

    origins: [
      {
        domainName: wwwRedirectBucket.websiteEndpoint,
        originId: wwwRedirectOriginId,
        connectionAttempts: 3,
        connectionTimeout: 3,

        customOriginConfig: {
          originSslProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
          originProtocolPolicy: 'http-only',
          originReadTimeout: 30,
          originKeepaliveTimeout: 5,
          httpPort: 80,
          httpsPort: 443
        }
      }
    ],

    defaultCacheBehavior: {
      allowedMethods: ['GET', 'HEAD'],
      cachedMethods: ['GET', 'HEAD'],
      targetOriginId: wwwRedirectOriginId,
      viewerProtocolPolicy: 'allow-all', //don't redirect to https; the entire distribution redirects already, so it wastes time

      cachePolicyId: managedCachingOptimizedPolicy.id!.apply(id => id!)
    },

    restrictions: {
      geoRestriction: {
        restrictionType: 'none'
      }
    },

    viewerCertificate: {
      acmCertificateArn: certificateValidation.certificateArn,
      minimumProtocolVersion: 'TLSv1.2_2019',
      sslSupportMethod: 'sni-only'
    }
  },
  {
    dependsOn: [wwwRedirectBucket, certificate, certificateValidation]
  }
);
