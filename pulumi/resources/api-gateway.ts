import { all as pulumiAll } from '@pulumi/pulumi';
import { apigateway, lambda } from '@pulumi/aws';
import { siteDomainName, region, accountId } from '../util/config';
import { defaultTags } from '../util/default-tags';
import { getStringHash } from '../util/hash';
import { lambdaFunction } from './lambda';

const apiGatewayRestApiName = `${siteDomainName}/api`;
export const apiGatewayRestApi = new apigateway.RestApi(
  apiGatewayRestApiName,
  {
    name: apiGatewayRestApiName,

    description: `API endpoints for ${siteDomainName}`,

    tags: defaultTags
  },
  {
    deleteBeforeReplace: true
  }
);

const apiGatewayProxyResourceName = `${apiGatewayRestApiName}/PROXY`;
export const apiGatewayProxyResource = new apigateway.Resource(
  apiGatewayProxyResourceName,
  {
    restApi: apiGatewayRestApi.id,
    parentId: apiGatewayRestApi.rootResourceId,
    pathPart: '{proxy+}'
  },
  {
    parent: apiGatewayRestApi,
    dependsOn: [apiGatewayRestApi]
  }
);

const apiGatewayProxyAnyMethodName = `${apiGatewayProxyResourceName}/ANY`;
export const apiGatewayProxyAnyMethod = new apigateway.Method(
  apiGatewayProxyAnyMethodName,
  {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayProxyResource.id,
    httpMethod: 'ANY',
    authorization: 'NONE',

    requestParameters: {
      'method.request.path.proxy': true
    }
  },
  {
    parent: apiGatewayProxyResource,
    dependsOn: [apiGatewayProxyResource]
  }
);

const apiGatewayProxyAnyImplName = `${apiGatewayProxyAnyMethodName}-impl`;
export const apiGatewayProxyAnyIntegration = new apigateway.Integration(
  apiGatewayProxyAnyImplName,
  {
    restApi: apiGatewayRestApi.id,
    resourceId: apiGatewayProxyResource.id,
    httpMethod: apiGatewayProxyAnyMethod.httpMethod,
    integrationHttpMethod: 'POST',
    type: 'AWS_PROXY',
    // "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:060232771263:function:brandonslade-me-api/invocations" => "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:060232771263:function:brandonslade-me-api-1eb6bae/invocations"
    uri: lambdaFunction.invokeArn,

    cacheKeyParameters: [
      'method.request.path.proxy'
    ],

    contentHandling: 'CONVERT_TO_TEXT'
  },
  {
    parent: apiGatewayProxyAnyMethod,
    dependsOn: [apiGatewayProxyAnyMethod, lambdaFunction]
  }
);

const apiGatewayProxyAnyLambdaPermissionName = `${apiGatewayProxyAnyMethodName}-lambdaPermission`;
export const apiGatewayProxyAnyLambdaPermission = new lambda.Permission(
  apiGatewayProxyAnyLambdaPermissionName,
  {
    statementId: apiGatewayProxyAnyLambdaPermissionName.replace(/[.\/-]+/g, '-'),
    function: lambdaFunction.arn,
    action: 'lambda:InvokeFunction',
    principal: 'apigateway.amazonaws.com',
    sourceArn: apiGatewayRestApi.id.apply(restApiId => `arn:aws:execute-api:${region}:${accountId}:${restApiId}/*/*/*`) //stage, method, resource
  },
  {
    parent: apiGatewayProxyAnyMethod,
    dependsOn: [apiGatewayProxyAnyMethod, lambdaFunction]
  }
);

const apiGatewayCurrentDeploymentName = `${apiGatewayRestApiName}/-/deployment/current`;
export const apiGatewayCurrentDeployment = new apigateway.Deployment(
  apiGatewayCurrentDeploymentName,
  {
    restApi: apiGatewayRestApi.id,

    triggers: {
      redeployment: pulumiAll([apiGatewayProxyResource.id, apiGatewayProxyAnyMethod.id, apiGatewayProxyAnyIntegration.id]).apply((ids) => {
        return `${getStringHash(JSON.stringify(ids))}`;
      })
    }
  },
  {
    parent: apiGatewayRestApi,
    dependsOn: [apiGatewayRestApi, apiGatewayProxyResource, apiGatewayProxyAnyMethod, lambdaFunction, apiGatewayProxyAnyLambdaPermission]
  }
);

const apiGatewayProdStageName = `${apiGatewayRestApiName}/-/stage/prod`;
export const apiGatewayProdStage = new apigateway.Stage(
  apiGatewayProdStageName,
  {
    restApi: apiGatewayRestApi.id,
    deployment: apiGatewayCurrentDeployment.id,
    stageName: 'prod', // Important because the stage name is used in some URLs to access the stage for the API gateway
    description: 'Production environment',
    cacheClusterSize: '0.5',

    tags: defaultTags
  },
  {
    parent: apiGatewayRestApi,
    dependsOn: [apiGatewayRestApi, apiGatewayCurrentDeployment],
    deleteBeforeReplace: true
  }
);

//TODO: add factory methods to automatically aggregate redeployment trigger dependencies for current deployment
