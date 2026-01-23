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
    unique: [[]],
    uniqueIfExists: [[]],
    indexes: [
      { spec: ['entity_type', 'entity_id', 'created_at'], options: {} },
      { spec: ['actor_name', 'created_at'], options: {} },
      { spec: ['opeartion_id', 'created_at'], options: {} },
    ],
    schema: {
      bsonType: 'object',
      required: [
        'operation_id',
        'actor_type',
        'module',
        'action',
        'created_at',
      ],
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
          description: 'Unique ID for this audit logs.',
        },
        operation_id: {
          bsonType: 'string',
          description: 'Identifier used to group multiple audit logs created by a single logical operation.',
        },
        entity_type: {
          bsonType: 'string',
          description: 'Type of domain entity affected by the action (e.g. invoice, payment, customer).',
        },
        entity_id: {
          bsonType: 'objectId',
          description: 'Identifier of the domain entity affected by the action.',
        },
        entity_ref: {
          bsonType: 'string',
          description: 'Human-readable reference or business identifier of the entity (e.g. CUST-0001, INV-0001).',
        },
        actor_type: {
          bsonType: 'string',
          description: 'Type of actor that performed the action (e.g. user, system, automation).',
        },
        actor_id: {
          bsonType: 'objectId',
          description: 'Identifier of the actor that performed the action, if applicable.',
        },
        actor_name: {
          bsonType: 'string',
          description: 'Actor display name recorded at the time of the event.',
        },
        action: {
          bsonType: 'string',
          description: 'Business-level action identifier representing what occurred (e.g. create, update, delete, approve).',
        },
        module: {
          bsonType: 'string',
          description: 'Domain module where the action occurred (e.g. invoice, payment, customer).',
        },
        system_reason: {
          bsonType: 'string',
          description: 'System-generated explanation describing why the entity was affected',
        },
        user_reason: {
          bsonType: 'string',
          description: 'User-provided explanation describing why the action was taken.',
        },
        changes: {
          bsonType: 'object',
          required: ['summary', 'snapshot'],
          additionalProperties: false,
          properties: {
            summary: {
              bsonType: 'object',
              required: ['fields', 'count'],
              properties: {
                fields: {
                  bsonType: 'array',
                  items: { bsonType: 'string' },
                  description: 'List of changed fields (dot notation).',
                },
                count: {
                  bsonType: 'int',
                  minimum: 0,
                  description: 'Number of changed fields.',
                },
              },
              additionalProperties: false,
            },
            snapshot: {
              bsonType: 'object',
              properties: {
                before: {
                  description: 'Entity state before change.',
                },
                after: {
                  description: 'Entity state after change.',
                },
              },
              additionalProperties: false,
            },
          },
        },
        metadata: {
          bsonType: 'object',
          description: 'Audit and contextual metadata tracking the origin and environment of the document.',
          properties: {
            ip: {
              bsonType: 'string',
              description: 'The IP address of the client (IPv4 or IPv6).',
            },
            device: {
              bsonType: 'object',
              description: 'Information regarding the physical hardware used to perform the action.',
              additionalProperties: false,
              properties: {
                type: {
                  bsonType: 'string',
                  description: 'The category of device (e.g., mobile, tablet, desktop, smarttv).',
                },
                model: {
                  bsonType: 'string',
                  description: 'The specific model name or number of the hardware.',
                },
                vendor: {
                  bsonType: 'string',
                  description: 'The manufacturer of the device (e.g., Apple, Samsung).',
                },
              },
            },
            browser: {
              bsonType: 'object',
              description: 'Details of the web browser or client application environment.',
              additionalProperties: false,
              properties: {
                type: {
                  bsonType: 'string',
                  description: 'The browser engine or category (e.g., browser, in-app).',
                },
                name: {
                  bsonType: 'string',
                  description: 'The commercial name of the browser (e.g., Chrome, Firefox).',
                },
                version: {
                  bsonType: 'string',
                  description: 'The full version string of the browser.',
                },
              },
            },
            os: {
              bsonType: 'object',
              description: 'The operating system environment of the client.',
              additionalProperties: false,
              properties: {
                name: {
                  bsonType: 'string',
                  description: 'The name of the OS (e.g., iOS, Android, Windows).',
                },
                version: {
                  bsonType: 'string',
                  description: 'The version or build number of the operating system.',
                },
              },
            },
          },
        },
        created_at: {
          bsonType: 'date',
          description: 'Timestamp indicating when the action was performed.',
        },
      },
    },
  },
];
