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
    unique: [['name']],
    uniqueIfExists: [],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['name'],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique ID for the document.',
        },
        name: {
          bsonType: 'string',
          description: 'The name of the permission entity.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when this record was created.',
        },
      },
    },
  },
];
