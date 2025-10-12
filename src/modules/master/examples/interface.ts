export interface IExampleEntity {
  _id?: string
  name?: string
  age?: number
  nationality?: IExampleNationality
  notes?: string
  created_at?: Date
  updated_at?: Date
}

export interface IExampleNationality {
  label?: string
  value?: string
}
