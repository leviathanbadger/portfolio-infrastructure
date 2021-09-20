import { iam, lambda } from '@pulumi/aws';
import { PolicyDocument } from '@pulumi/aws/iam';
import { lambdaNamePrefix, region, accountId } from '../util/config';
import { defaultTags } from '../util/default-tags';
import { projectsTable } from './dynamodb';

const lambdaRoleName = `${lambdaNamePrefix}-api-role`;
export const apiLambdaRole = new iam.Role(
  lambdaRoleName,
  {
    name: lambdaRoleName,

    assumeRolePolicy: <iam.PolicyDocument>{
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowLambda',
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          }
        }
      ]
    },

    tags: defaultTags
  },
  {
    deleteBeforeReplace: true
  }
);

const lambdaPolicyName = `${lambdaNamePrefix}-api-policy`;
export const apiLambdaPolicy = new iam.Policy(
  lambdaPolicyName,
  {
    name: lambdaPolicyName,

    policy: projectsTable.arn.apply(projectsTableArn => <PolicyDocument>({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'CloudWatchCreateLogGroup',
          Effect: 'Allow',
          Action: 'logs:CreateLogGroup',
          Resource: `arn:aws:logs:${region}:${accountId}:*`
        },
        {
          Sid: 'CloudWatchSendLogs',
          Effect: 'Allow',
          Action: [
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          Resource: [
            `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaNamePrefix}-api:*`
          ]
        },
        {
          Sid: 'DynamoDBRead',
          Effect: 'Allow',
          Action: [
            'dynamodb:Scan'
          ],
          Resource: [
            `${projectsTableArn}/index/*`,
            `${projectsTableArn}`
          ]
        }
      ]
    })),

    tags: defaultTags
  },
  {
    parent: apiLambdaRole,
    dependsOn: [apiLambdaRole, projectsTable],
    deleteBeforeReplace: true
  }
);

const lambdaRolePolicyName = `${lambdaNamePrefix}-api-role-policy`;
export const apiLambdaRolePolicy = new iam.RolePolicyAttachment(
  lambdaRolePolicyName,
  {
    role: apiLambdaRole.name,
    policyArn: apiLambdaPolicy.arn
  },
  {
    parent: apiLambdaPolicy,
    dependsOn: [apiLambdaRole, apiLambdaPolicy],
    deleteBeforeReplace: true
  }
);

const lambdaFunctionName = `${lambdaNamePrefix}-api`;
export const lambdaFunction = new lambda.Function(
  lambdaFunctionName,
  {
    // Previous role: arn:aws:iam::060232771263:role/service-role/brandonslade-me-api-role-c9kz6bws
    role: apiLambdaRole.arn,
    packageType: 'Image',
    memorySize: 128,
    timeout: 10,

    // TODO: don't hardcode
    imageUri: `${accountId}.dkr.ecr.${region}.amazonaws.com/brandonslade.me/api@sha256:7d95e36f41994fe2ba72c1f54f7dc8f31a3e24a453ac5288a4375c9fd237a9e3`
  },
  {
    dependsOn: [apiLambdaRole]
  }
);
