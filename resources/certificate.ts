import { route53, acm } from '@pulumi/aws';
import { siteDomainName } from '../util/config';
import { defaultTags } from '../util/default-tags';
import { dnsZone } from './dns-zone';

const certificateName = `cert/${siteDomainName}`;
export const certificate = new acm.Certificate(
  certificateName,
  {
    domainName: siteDomainName,
    validationMethod: 'DNS',

    subjectAlternativeNames: [
      `www.${siteDomainName}`
    ],

    tags: defaultTags
  },
  {
    protect: true
  }
);

export const certificateValidationFqdns = certificate.domainValidationOptions.apply(dvos => {
  return dvos.map(dvo => {
    const certificateValidationDnsRecordName = `dns/${dvo.resourceRecordName.replace(/[.]$/g, '')}/${dvo.resourceRecordType}`;
    let record = new route53.Record(
      certificateValidationDnsRecordName,
      {
        zoneId: dnsZone.zoneId,
        name: dvo.resourceRecordName,
        ttl: 60,
        records: [dvo.resourceRecordValue],
        type: dvo.resourceRecordType,
        allowOverwrite: true
      },
      {
        parent: dnsZone
      }
    );
    return record.fqdn;
  });
});

const certificateValidationName = `cert/${siteDomainName}/validation`;
export const certificateValidation = new acm.CertificateValidation(
  certificateValidationName,
  {
    certificateArn: certificate.arn,
    validationRecordFqdns: certificateValidationFqdns
  },
  {
    parent: certificate,
    dependsOn: [certificate] //TODO MAYBE: add DNS record resources here? Not strictly necessary...
  }
);
