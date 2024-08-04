import { IExampleEntity } from './interface'

export const collectionName = 'examples'

export class ExampleEntity {
  constructor(public data: IExampleEntity) {}

  public generateCreatedDate() {
    this.data.created_date = new Date()
  }

  public generateUpdatedDate() {
    this.data.updated_date = new Date()
  }
}
