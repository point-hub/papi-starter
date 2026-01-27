import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';
import type { ICodeGeneratorService } from '@/modules/counters/services/code-generator.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName, ExampleEntity } from '../entity';
import type { ICreateRepository } from '../repositories/create.repository';

export interface IInput {
  ip: string
  authUser: IAuthUser
  userAgent: IUserAgent
  data: {
    code: string
    name: string
    age: number
    gender: string
    notes: string
    composite_unique_1: string
    composite_unique_2: string
    optional_unique: string
    optional_composite_unique_1: string
    optional_composite_unique_2: string
    xxx_composite_unique_1: string
    xxx_composite_unique_2: string
  }
}

export interface IDeps {
  createRepository: ICreateRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  authorizationService: IAuthorizationService
  codeGeneratorService: ICodeGeneratorService
  uniqueValidationService: IUniqueValidationService
}

export interface ISuccessData {
  inserted_id: string
}

/**
 * Use case: Create Example.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action.
 * - Normalizes data (trim).
 * - Validate uniqueness: single unique code field.
 * - Validate uniqueness: single unique name field.
 * - Validate uniqueness: composite unique fields.
 * - Validate uniqueness: optional single unique field (ignore undefined values).
 * - Validate uniqueness: optional composite unique fields (ignore undefined values).
 * - Validate uniqueness: error attribute remapping.
 * - Save the data to the database.
 * - Increment the code counter.
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Return a success response.
 */
export class CreateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'examples:create');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Normalizes data (trim).
    const exampleEntity = new ExampleEntity({
      code: input.data.code,
      name: input.data.name,
      age: input.data.age,
      gender: input.data.gender,
      notes: input.data.notes,
      composite_unique_1: input.data.composite_unique_1,
      composite_unique_2: input.data.composite_unique_2,
      optional_unique: input.data.optional_unique,
      optional_composite_unique_1: input.data.optional_composite_unique_1,
      optional_composite_unique_2: input.data.optional_composite_unique_2,
      xxx_composite_unique_1: input.data.xxx_composite_unique_1,
      xxx_composite_unique_2: input.data.xxx_composite_unique_2,
      is_archived: false,
      created_at: new Date(),
      created_by_id: input.authUser._id,
    });

    // Validate uniqueness: single unique code field.
    const uniqueCodeErrors = await this.deps.uniqueValidationService.validate(collectionName, { code: input.data.code });
    if (uniqueCodeErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueCodeErrors });
    }

    // Validate uniqueness: single unique name field.
    const uniqueNameErrors = await this.deps.uniqueValidationService.validate(collectionName, { name: input.data.name });
    if (uniqueNameErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueNameErrors });
    }

    // Validate uniqueness: composite unique fields.
    const errors2 = await this.deps.uniqueValidationService.validate(collectionName, {
      composite_unique_1: input.data.composite_unique_1,
      composite_unique_2: input.data.composite_unique_2,
    });
    if (errors2) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors2 });
    }

    // Validate uniqueness: optional single unique field (ignore undefined values).
    const errors3 = await this.deps.uniqueValidationService.validate(
      collectionName,
      { optional_unique: input.data.optional_unique },
      { ignoreUndefined: true },
    );
    if (errors3) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors3 });
    }

    // Validate uniqueness: optional composite unique fields (ignore undefined values).
    const errors4 = await this.deps.uniqueValidationService.validate(
      collectionName,
      {
        optional_composite_unique_1: input.data.optional_composite_unique_1,
        optional_composite_unique_2: input.data.optional_composite_unique_2,
      },
      { ignoreUndefined: true },
    );
    if (errors4) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors4 });
    }

    // Validate uniqueness: error attribute remapping.
    const errors5 = await this.deps.uniqueValidationService.validate(
      collectionName,
      {
        xxx_composite_unique_1: input.data.xxx_composite_unique_1,
        xxx_composite_unique_2: input.data.xxx_composite_unique_2,
      },
      {
        ignoreUndefined: true,
        replaceErrorAttribute: {
          xxx_composite_unique_1: 'composite_unique_1',
          xxx_composite_unique_2: 'composite_unique_2',
        },
      },
    );
    if (errors5) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors5 });
    }

    // Save the data to the database.
    const createResponse = await this.deps.createRepository.handle(exampleEntity.data);

    // Increment the code counter.
    await this.deps.codeGeneratorService.increment(collectionName);

    // Create an audit log entry for this operation.
    const changes = this.deps.auditLogService.buildChanges({}, exampleEntity.data);
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: createResponse.inserted_id,
      entity_ref: `[${input.data.code}] ${input.data.name}`,
      actor_type: 'user',
      actor_id: input.authUser._id,
      actor_name: input.authUser.username,
      action: 'create',
      module: 'examples',
      system_reason: 'insert data',
      changes: changes,
      metadata: {
        ip: input.ip,
        device: input.userAgent.device,
        browser: input.userAgent.browser,
        os: input.userAgent.os,
      },
      created_at: new Date(),
    };
    await this.deps.auditLogService.log(dataLog);

    // Publish realtime notification event to the recipient’s channel.
    this.deps.ablyService.publish(`notifications:${input.authUser._id}`, 'logs:new', {
      type: 'examples',
      actor_id: input.authUser._id,
      recipient_id: input.authUser._id,
      is_read: false,
      created_at: new Date(),
      entities: {
        examples: createResponse.inserted_id,
      },
      data: dataLog,
    });

    // Return a success response.
    return this.success({
      inserted_id: createResponse.inserted_id,
    });
  }
}
