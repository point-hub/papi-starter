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
    unique: [['email'], ['trimmed_email']],
    uniqueIfExists: [['username'], ['trimmed_username']],
    indexes: [],
    schema: {
      bsonType: 'object',
      required: ['email', 'username', 'name'],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique identifier for the document.',
        },
        role_id: {
          bsonType: 'objectId',
          description: 'Reference to the role associated with this document.',
        },
        name: {
          bsonType: 'string',
          description: 'The full name of the user.',
        },
        username: {
          bsonType: 'string',
          description: 'The unique username chosen by the user.',
        },
        trimmed_username: {
          bsonType: 'string',
          description: 'A normalized username used for uniqueness checks (spaces removed).',
        },
        email: {
          bsonType: 'string',
          description: 'The email address of the user.',
        },
        trimmed_email: {
          bsonType: 'string',
          description: 'A normalized email used for uniqueness checks (ignores dots and "+").',
        },
        avatar_url: {
          bsonType: 'string',
          description: 'URL of the user’s avatar image.',
        },
        password: {
          bsonType: 'string',
          description: 'The hashed password of the user.',
        },
        notes: {
          bsonType: 'string',
          description: 'The notes of the user.',
        },
        email_verification: {
          bsonType: 'object',
          properties: {
            code: {
              bsonType: 'string',
              description: 'The verification code used to confirm the user’s email.',
            },
            url: {
              bsonType: 'string',
              description: 'Verification URL sent to the user.',
            },
            requested_at: {
              bsonType: 'date',
              description: 'When the verification was requested.',
            },
            is_verified: {
              bsonType: 'bool',
              description: 'Whether the email has been verified.',
            },
            verified_at: {
              bsonType: 'date',
              description: 'When the email was verified.',
            },
          },
        },
        request_password: {
          bsonType: 'object',
          properties: {
            requested_at: {
              bsonType: 'date',
              description: 'When the password reset was requested.',
            },
            code: {
              bsonType: 'string',
              description: 'Password reset verification code.',
            },
            url: {
              bsonType: 'string',
              description: 'Password reset URL sent to the user.',
            },
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
          description: 'Timestamp indicating when the user account was created.',
        },
      },
    },
  },
];
