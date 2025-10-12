import { type IExampleEntity } from './interface'

export const collectionName = 'examples'

export class ExampleEntity {
  constructor(public data: IExampleEntity) {}
}
