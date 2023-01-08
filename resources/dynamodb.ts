import { dynamodb } from '@pulumi/aws';
import { dynamodbTableNameHoudiniDailyPractice, dynamodbTableNamePrefix, dynamodbTableNameProjects, dynamodbTableNameRustEngineTimelineEntry } from '../util/config';
import { defaultTags } from '../util/default-tags';

const projectsTableName = `${dynamodbTableNamePrefix}${dynamodbTableNameProjects}`;
export const projectsTable = new dynamodb.Table(
  projectsTableName,
  {
    name: projectsTableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'Slug',

    tags: defaultTags,

    attributes: [{
      name: 'Slug',
      type: 'S'
    }]
  },
  {
    deleteBeforeReplace: true,
    protect: true
  }
);

const houdiniPracticeTableName = `${dynamodbTableNamePrefix}${dynamodbTableNameHoudiniDailyPractice}`;
export const houdiniDailyPracticeTable = new dynamodb.Table(
  houdiniPracticeTableName,
  {
    name: houdiniPracticeTableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'Id',

    tags: defaultTags,

    attributes: [{
      name: 'Id',
      type: 'N'
    }]
  },
  {
    deleteBeforeReplace: true,
    protect: true
  }
);

const rustEngineTimelineEntryTableName = `${dynamodbTableNamePrefix}${dynamodbTableNameRustEngineTimelineEntry}`;
export const rustEngineTimelineEntryTable = new dynamodb.Table(
  rustEngineTimelineEntryTableName,
  {
    name: rustEngineTimelineEntryTableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'Id',

    tags: defaultTags,

    attributes: [{
      name: 'Id',
      type: 'N'
    }]
  },
  {
    deleteBeforeReplace: true,
    protect: true
  }
);
