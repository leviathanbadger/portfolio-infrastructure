import { route53 } from '@pulumi/aws';
import { siteDomainName } from '../util/config';
import { defaultTags } from '../util/default-tags';

const dnsZoneName = `dns/${siteDomainName}/zone`;
export const dnsZone = new route53.Zone(
  dnsZoneName,
  {
    name: siteDomainName,
    comment: 'Personal portfolio',
    forceDestroy: true,

    tags: defaultTags
  },
  {
    deleteBeforeReplace: true,
    protect: true
  }
);
