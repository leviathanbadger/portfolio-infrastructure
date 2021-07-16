import { region, env, siteDomainName } from './config';
import { getProject, getStack } from '@pulumi/pulumi';

export const defaultTags: { [key: string]: string } = {
  ManagedBy: 'Pulumi',
  'Pulumi:Project': getProject(),
  'Pulumi:Stack': getStack(),
  Environment: env,
  Project: 'Portfolio site',
  Site: siteDomainName,
  HostedBy: 'AWS',
  HostedRegion: region
};
