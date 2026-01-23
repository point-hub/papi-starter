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
    unique: [['name'], ['template']],
    uniqueIfExists: [[]],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['name', 'template', 'seq', 'seq_pad'],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique ID for the document.',
        },
        name: {
          bsonType: 'string',
          description: 'Unique feature name identifier (e.g. "customer", "invoice").',
        },
        template: {
          bsonType: 'string',
          description: 'Unique template (e.g. "CUSTOMER/0001", "INVOICE/0001/XII/25").',
        },
        seq: {
          bsonType: 'int',
          minimum: 0,
          description: 'Monotonically increasing sequence value. Must never be decremented or reused.',
        },
        seq_pad: {
          bsonType: 'int',
          minimum: 0,
          maximum: 8,
          description: 'Number of digits used to pad the sequence with leading zeros.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when this record was created.',
        },
        updated_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when this record was updated.',
        },
      },
    },
  },
];
