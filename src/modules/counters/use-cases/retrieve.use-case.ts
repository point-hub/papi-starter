import { BaseUseCase, type IUseCaseOutputFailed, type IUseCaseOutputSuccess } from '@point-hub/papi';

import type { IAuthorizationService } from '@/modules/_shared/services/authorization.service';
import type { ICodeGeneratorService } from '@/modules/counters/services/code-generator.service';
import type { IAuthUser } from '@/modules/master/users/interface';

import type { IRetrieveManyRepository } from '../repositories/retrieve-many.repository';

export interface IInput {
  authUser: IAuthUser
  filter: {
    name: string
    date: string
  }
}

export interface IDeps {
  retrieveManyRepository: IRetrieveManyRepository
  authorizationService: IAuthorizationService
  codeGeneratorService: ICodeGeneratorService
}

export interface ISuccessData {
  _id: string
  name: string
  template: string
  seq: number
  seq_pad: number
  notes?: string
  value: string
  created_at: Date
  updated_by?: IAuthUser
}

/**
 * Use case: Retrieve one.
 *
 * Responsibilities:
 * - Check whether the user is authorized to perform this action
 * - Retrieve a single data record from the database.
 * - Generate a value of selected template
 * - Return a success response.
 */
export class RetrieveUseCase extends BaseUseCase<IInput, IDeps, ISuccessData> {
  async handle(input: IInput): Promise<IUseCaseOutputSuccess<ISuccessData> | IUseCaseOutputFailed> {
    // Retrieve a single data record from the database.
    const response = await this.deps.retrieveManyRepository.handle({ filter: { name: input.filter.name } });
    if (response.data.length === 0) {
      return this.fail({
        code: 404,
        message: 'The requested data does not exist.',
      });
    }

    // Generate a value of selected template
    const value = this.deps.codeGeneratorService.generate({
      name: response.data[0].name,
      template: response.data[0].template,
      seq: response.data[0].seq,
      seq_pad: response.data[0].seq_pad,
      date: input.filter.date,
    });

    // Return a success response.
    return this.success({
      _id: response.data[0]._id,
      name: response.data[0].name,
      template: response.data[0].template,
      seq: response.data[0].seq,
      seq_pad: response.data[0].seq_pad,
      notes: response.data[0].notes,
      value: value,
      created_at: response.data[0].created_at,
    });
  }
}
