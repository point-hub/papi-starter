export interface IExample {
  _id?: string
  code?: string
  name?: string
  age?: number | null | undefined
  gender?: string
  notes?: string | null | undefined
  composite_unique_1?: string
  composite_unique_2?: string
  optional_unique?: string
  optional_composite_unique_1?: string
  optional_composite_unique_2?: string
  xxx_composite_unique_1?: string
  xxx_composite_unique_2?: string
  is_archived?: boolean | null | undefined
  created_at?: Date
  created_by_id?: string
}
