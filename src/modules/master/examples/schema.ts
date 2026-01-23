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
    unique: [['code'], ['name'], ['composite_unique_1', 'composite_unique_2']],
    uniqueIfExists: [['optional_unique'], ['optional_composite_unique_1', 'optional_composite_unique_2'], ['xxx_composite_unique_1', 'xxx_composite_unique_2']],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['code', 'name', 'gender', 'composite_unique_1', 'composite_unique_2'],
      // additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique ID for the document.',
        },
        code: {
          bsonType: 'string',
          description: 'The code of the example entity.',
        },
        name: {
          bsonType: 'string',
          description: 'The name of the example entity.',
        },
        composite_unique_1: {
          bsonType: 'string',
          description: 'The composite_unique_1 of the example entity.',
        },
        composite_unique_2: {
          bsonType: 'string',
          description: 'The composite_unique_2 of the example entity.',
        },
        optional_unique: {
          bsonType: 'string',
          description: 'The optional_unique of the example entity.',
        },
        optional_composite_unique_1: {
          bsonType: 'string',
          description: 'The optional_composite_unique_1 of the example entity.',
        },
        optional_composite_unique_2: {
          bsonType: 'string',
          description: 'The optional_composite_unique_2 of the example entity.',
        },
        xxx_composite_unique_1: {
          bsonType: 'string',
          description: 'The xxx_composite_unique_1 of the example entity.',
        },
        xxx_composite_unique_2: {
          bsonType: 'string',
          description: 'The xxx_composite_unique_2 of the example entity.',
        },
        age: {
          bsonType: 'number',
          description: 'The age value associated with the example entity.',
        },
        gender: {
          bsonType: 'string',
          description: 'The gender associated with the example entity.',
        },
        notes: {
          bsonType: 'string',
          description: 'Additional notes or information about the example entity.',
        },
        is_archived: {
          bsonType: 'bool',
          description: 'Indicates whether the record is archived.',
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when this record was created.',
        },
        created_by_id: {
          bsonType: 'objectId',
          description: 'The ID of the user who created this record.',
        },
      },
    },
  },
];
