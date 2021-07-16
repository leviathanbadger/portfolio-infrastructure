import { iam, lambda } from '@pulumi/aws';
import { lambdaNamePrefix, region, accountId } from '../util/config';
import { defaultTags } from '../util/default-tags';
// import { projectsTable } from './dynamodb';

const lambdaRoleName = `${lambdaNamePrefix}-api-role`;
export const apiLambdaRole = new iam.Role(
  'api-lambda-role',
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

    // inlinePolicies: [
    //   {
    //     policy: JSON.stringify({
    //       Version: '2012-10-17',
    //       Statement: [
    //         {
    //           Sid: 'CloudWatchCreateLogGroup',
    //           Effect: 'Allow',
    //           Action: 'logs:CreateLogGroup',
    //           Resource: 'arn:aws:logs:${var.region}:${var.account_id}:*'
    //         },
    //         {
    //           Sid: 'CloudWatchSendLogs',
    //           Effect: 'Allow',
    //           Action: [
    //             'logs:CreateLogStream',
    //             'logs:PutLogEvents'
    //           ],
    //           Resource: [
    //             `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaNamePrefix}-api:*`
    //           ]
    //         },
    //         {
    //           Sid: 'DynamoDBRead',
    //           Effect: 'Allow',
    //           Action: [
    //             'dynamodb:Scan'
    //           ],
    //           Resource: projectsTable.arn.apply(projectsTableArn => [
    //             `${projectsTableArn}/index/*`,
    //             `${projectsTableArn}`
    //           ])
    //         }
    //       ]
    //     })
    //   }
    // ],

    tags: defaultTags
  }
);
