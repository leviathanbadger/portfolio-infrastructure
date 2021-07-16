import { Config as PulumiConfig } from '@pulumi/pulumi';

export const config = new PulumiConfig();

export const env = config.require('env');
export const siteDomainName = config.get('siteDomainName') ?? 'brandonslade.me';
export const siteBucketName = config.get('siteBucketName') ?? 'brandonslade-me';
export const dynamodbTableNamePrefix = config.get('dynamodbTableNamePrefix') ?? 'Portfolio';
export const dynamodbTableNameProjects = config.get('dynamodbTableNameProjects') ?? 'Projects';
export const lambdaNamePrefix = config.get('lambdaNamePrefix') ?? 'brandonslade-me';
export const accountId = config.require('awsAccountId');

const awsConfig = new PulumiConfig('aws');
export const region = awsConfig.require('region');
