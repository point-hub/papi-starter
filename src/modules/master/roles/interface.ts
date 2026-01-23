export interface IRole {
  _id?: string
  code?: string
  name?: string
  notes?: string | null
  permissions?: string[]
  is_archived?: boolean | null
  created_by_id?: string
  created_at?: Date
}
