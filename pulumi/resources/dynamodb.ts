import { dynamodb } from '@pulumi/aws';
import { dynamodbTableNamePrefix, dynamodbTableNameProjects } from '../util/config';
import { defaultTags } from '../util/default-tags';

const projectsTableName = `${dynamodbTableNamePrefix}${dynamodbTableNameProjects}`;
export const projectsTable = new dynamodb.Table(
  'projects-table',
  {
    name: projectsTableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'Slug',

    tags: defaultTags,

    attributes: [{
      name: 'Slug',
      type: 'S'
    }]
  }
)
