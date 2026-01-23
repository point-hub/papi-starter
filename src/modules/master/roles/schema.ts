/**
 * MongoDB Schema
 *
 * https://www.mongodb.com/docs/current/core/schema-validation/update-schema-validation/
 * https://www.mongodb.com/docs/drivers/node/current/fundamentals/indexes/
 * https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/
 */

import type { ISchema } from '@point-hub/papi';

import { collectionName } from './entity';

export const schema: ISchema[] = [
  {
    collection: collectionName,
    unique: [['code'], ['name']],
    uniqueIfExists: [],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['code', 'name'],
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique ID for the document.',
        },
        code: {
          bsonType: 'string',
          description: 'The code of the role entity.',
        },
        name: {
          bsonType: 'string',
          description: 'The name of the role entity.',
        },
        notes: {
          bsonType: 'string',
          description: 'The notes of the role entity.',
        },
        permissions: {
          bsonType: 'array',
          description: 'The permissions of the role entity.',
          items: {
            bsonType: 'string',
          },
        },
        is_archived: {
          bsonType: 'bool',
          description: 'Indicates whether the record is archived.',
        },
        created_by_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who created this record.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when this record was created.',
        },
      },
    },
  },
];
