import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { IUniqueValidationService } from '@/modules/_shared/services/unique-validation.service';
import type { IUserAgent } from '@/modules/_shared/types/user-agent.type';
import type { IAblyService } from '@/modules/ably/services/ably.service';
import type { IAuditLogService } from '@/modules/audit-logs/services/audit-log.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import { collectionName, ExampleEntity } from '../entity';
import type { IRetrieveRepository } from '../repositories/retrieve.repository';
import type { IUpdateRepository } from '../repositories/update.repository';

export interface IInput {
  authUser: IAuthUser
  userAgent: IUserAgent
  ip: string
  filter: {
    _id: string
  }
  data?: {
    code?: string
    name?: string
    age?: number
    gender?: string
    notes?: string
    composite_unique_1?: string
    composite_unique_2?: string
    optional_unique?: string
    optional_composite_unique_1?: string
    optional_composite_unique_2?: string
    xxx_composite_unique_1?: string
    xxx_composite_unique_2?: string
    update_reason?: string
    is_archived?: boolean
  }
}

export interface IDeps {
  updateRepository: IUpdateRepository
  retrieveRepository: IRetrieveRepository
  ablyService: IAblyService
  auditLogService: IAuditLogService
  authorizationService: IAuthorizationService
  uniqueValidationService: IUniqueValidationService
}

export interface ISuccessData {
  matched_count: number
  modified_count: number
}

/**
 * Use case: Update Example.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Check if the record exists
 * - Normalizes data (trim).
 * - Validate uniqueness: single unique code field.
 * - Validate uniqueness: single unique name field.
 * - Validate uniqueness: composite unique fields.
 * - Validate uniqueness: optional single unique field (ignore undefined values).
 * - Validate uniqueness: optional composite unique fields (ignore undefined values).
 * - Validate uniqueness: error attribute remapping.
 * - Reject update when no fields have changed
 * - Save the data to the database.
 * - Create an audit log entry for this operation.
 * - Publish realtime notification event to the recipient’s channel.
 * - Return a success response.
 */
export class UpdateUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Check whether the user is authorized to perform this action
    const isAuthorized = this.deps.authorizationService.hasAccess(input.authUser.role?.permissions, 'examples:update');
    if (!isAuthorized) {
      return this.fail({ code: 403, message: 'You do not have permission to perform this action.' });
    }

    // Check if the record exists.
    const retrieveResponse = await this.deps.retrieveRepository.raw(input.filter._id);
    if (!retrieveResponse) {
      return this.fail({ code: 404, message: 'Resource not found' });
    }

    // Normalizes data (trim).
    const exampleEntity = new ExampleEntity({
      code: input.data?.code,
      name: input.data?.name,
      age: input.data?.age,
      gender: input.data?.gender,
      notes: input.data?.notes,
      composite_unique_1: input.data?.composite_unique_1,
      composite_unique_2: input.data?.composite_unique_2,
      optional_unique: input.data?.optional_unique,
      optional_composite_unique_1: input.data?.optional_composite_unique_1,
      optional_composite_unique_2: input.data?.optional_composite_unique_2,
      xxx_composite_unique_1: input.data?.xxx_composite_unique_1,
      xxx_composite_unique_2: input.data?.xxx_composite_unique_2,
      is_archived: input.data?.is_archived,
    });

    // Validate uniqueness: single unique code field.
    const uniqueCodeErrors = await this.deps.uniqueValidationService.validate(
      collectionName,
      { code: input.data?.code },
      { except: { _id: input.filter._id } },
    );
    if (uniqueCodeErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueCodeErrors });
    }

    // Validate uniqueness: single unique name field.
    const uniqueNameErrors = await this.deps.uniqueValidationService.validate(
      collectionName,
      { name: input.data?.name },
      { except: { _id: input.filter._id } },
    );
    if (uniqueNameErrors) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: uniqueNameErrors });
    }

    // Validate uniqueness: composite unique fields.
    const errors2 = await this.deps.uniqueValidationService.validate(
      collectionName,
      {
        composite_unique_1: input.data?.composite_unique_1,
        composite_unique_2: input.data?.composite_unique_2,
      },
      { except: { _id: input.filter._id } },
    );
    if (errors2) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors2 });
    }

    // Validate uniqueness: optional single unique field (ignore undefined values).
    const errors3 = await this.deps.uniqueValidationService.validate(
      collectionName,
      { optional_unique: input.data?.optional_unique },
      {
        except: { _id: input.filter._id },
        ignoreUndefined: true,
      },
    );
    if (errors3) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors3 });
    }

    // Validate uniqueness: optional composite unique fields (ignore undefined values).
    const errors4 = await this.deps.uniqueValidationService.validate(
      collectionName,
      {
        optional_composite_unique_1: input.data?.optional_composite_unique_1,
        optional_composite_unique_2: input.data?.optional_composite_unique_2,
      },
      {
        except: { _id: input.filter._id },
        ignoreUndefined: true,
      },
    );
    if (errors4) {
      return this.fail({ code: 422, message: 'Validation failed due to duplicate values.', errors: errors4 });
    }

    // Validate uniqueness: error attribute remapping.
    const errors5 = await this.deps.uniqueValidationService.validate(
      collectionName,
      {
        xxx_composite_unique_1: input.data?.xxx_composite_unique_1,
        xxx_composite_unique_2: input.data?.xxx_composite_unique_2,
      },
      {
        except: { _id: input.filter._id },
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

    // Reject update when no fields have changed
    const changes = this.deps.auditLogService.buildChanges(
      retrieveResponse,
      this.deps.auditLogService.mergeDefined(retrieveResponse, exampleEntity.data),
    );
    if (changes.summary.fields?.length === 0) {
      return this.fail({ code: 400, message: 'No changes detected. Please modify at least one field before saving.' });
    }

    // Save the data to the database.
    const response = await this.deps.updateRepository.handle(input.filter._id, exampleEntity.data);

    // Create an audit log entry for this operation.
    const dataLog = {
      operation_id: this.deps.auditLogService.generateOperationId(),
      entity_type: collectionName,
      entity_id: input.filter._id,
      entity_ref: `[${retrieveResponse.code}] ${retrieveResponse.name}`,
      actor_type: 'user',
      actor_id: input.authUser._id,
      actor_name: input.authUser.username,
      action: 'update',
      module: 'example',
      system_reason: 'update data',
      user_reason: input.data?.update_reason,
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
        examples: input.filter._id,
      },
      data: dataLog,
    });

    // Return a success response.
    return this.success({
      matched_count: response.matched_count,
      modified_count: response.modified_count,
    });
  }
}
