import { s3 } from '@pulumi/aws';
import { PolicyDocument } from '@pulumi/aws/iam';
import { siteBucketName, siteDomainName } from '../util/config';
import { defaultTags } from '../util/default-tags';

export const primaryBucket = new s3.Bucket(
  siteBucketName,
  {
    bucket: siteBucketName,
    acl: 'private',
    tags: defaultTags,

    versioning: {
      enabled: true
    },

    lifecycleRules: [
      {
        id: 'remove-previous-versions',
        enabled: true,
        abortIncompleteMultipartUploadDays: 0,

        noncurrentVersionExpiration: {
          days: 30
        }
      }
    ],

    serverSideEncryptionConfiguration: {
      rule: {
        bucketKeyEnabled: false,

        applyServerSideEncryptionByDefault: {
          sseAlgorithm: 'AES256'
        }
      }
    }
  }
);

export const primaryBucketPolicy = new s3.BucketPolicy(
  siteBucketName,
  {
    bucket: primaryBucket.id,

    policy: primaryBucket.arn.apply(bucketArn => <PolicyDocument>({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: [
            's3:GetObject',
            's3:GetObjectVersion'
          ],
          Resource: [
            `${bucketArn}/dist/*`,
            `${bucketArn}/assets/*`
          ]
        }
      ]
    }))
  },
  {
    parent: primaryBucket
  }
);

const wwwRedirectBucketName = `${siteBucketName}-www-redirect`;
export const wwwRedirectBucket = new s3.Bucket(
  wwwRedirectBucketName,
  {
    bucket: wwwRedirectBucketName,
    acl: 'private',
    tags: defaultTags,

    versioning: {
      enabled: true
    },

    website: {
      redirectAllRequestsTo: `https://${siteDomainName}`
    },

    lifecycleRules: [
      {
        id: 'remove-previous-versions',
        enabled: true,
        abortIncompleteMultipartUploadDays: 0,

        noncurrentVersionExpiration: {
          days: 30
        }
      }
    ],

    serverSideEncryptionConfiguration: {
      rule: {
        bucketKeyEnabled: false,

        applyServerSideEncryptionByDefault: {
          sseAlgorithm: 'AES256'
        }
      }
    }
  }
);

export const wwwRedirectBucketPolicy = new s3.BucketPolicy(
  wwwRedirectBucketName,
  {
    bucket: wwwRedirectBucket.id,

    policy: wwwRedirectBucket.arn.apply(bucketArn => <PolicyDocument>({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: [
            's3:GetObject',
            's3:GetObjectVersion'
          ],
          Resource: [
            `${bucketArn}/*`
          ]
        }
      ]
    }))
  },
  {
    parent: wwwRedirectBucket
  }
);
