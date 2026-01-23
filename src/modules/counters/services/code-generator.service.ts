import { type IDatabase } from '@point-hub/papi';

export interface IData {
  name: string
  template: string
  seq: number
  seq_pad: number
  date: string
}

export interface ICreateResponse {
  inserted_id: string
}

export interface ICodeGeneratorService {
  increment(name: string, inc?: number): Promise<void>
  generate(data: IData): string;
}

export class CodeGeneratorService implements ICodeGeneratorService {
  constructor(
    public database: IDatabase,
    public options?: Record<string, unknown>,
  ) { }

  async increment(name: string, inc = 1) {
    await this.database.collection('counters').update({ name }, { seq: { $inc: inc } });
  }

  generate(data: IData) {
    let result = data.template;

    if (data.template.includes('<seq>')) {
      result = result.replaceAll('<seq>', (data.seq + 1).toString().padStart(data.seq_pad, '0'));
    }

    if (data.template.includes('<yyyy>')) {
      result = result.replaceAll('<yyyy>', new Date(data.date).getFullYear().toString());
    }

    if (data.template.includes('<mm>')) {
      result = result.replaceAll('<mm>', (new Date(data.date).getMonth() + 1).toString());
    }

    return result;
  };
};
