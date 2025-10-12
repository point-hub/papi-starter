export interface IModuleExampleEntity {
  _id?: string
  name?: string
  age?: number
  nationality?: IModuleExampleNationality
  notes?: string
  created_at?: Date
  updated_at?: Date
}

export interface IModuleExampleNationality {
  label?: string
  value?: string
}
