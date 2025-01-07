import { type IExampleEntity } from './interface'

export const collectionName = 'examples'

export type TypeFieldDate = 'created_date' | 'updated_date'

export class ExampleEntity {
  constructor(public data: IExampleEntity) {}

  public generateDate(field: TypeFieldDate) {
    this.data[field] = new Date()
  }
}
