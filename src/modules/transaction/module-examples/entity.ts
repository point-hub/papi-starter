import { type IModuleExampleEntity } from './interface'

export const collectionName = 'module_examples'

export class ModuleExampleEntity {
  constructor(public data: IModuleExampleEntity) {}
}
