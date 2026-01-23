export interface IUser {
  _id?: string
  role_id?: string
  name?: string
  username?: string
  trimmed_username?: string
  email?: string
  trimmed_email?: string
  avatar_url?: string
  notes?: string | null
  password?: string
  email_verification?: {
    code?: string | null
    url?: string | null
    requested_at?: Date | null
    is_verified?: boolean
    verified_at?: Date | null
  }
  request_password?: {
    requested_at?: Date | null
    code?: string | null
    url?: string | null
  } | null
  is_archived?: boolean | null
  created_by_id?: string
  created_at?: Date
}

export interface IAuthUser {
  _id?: string
  name?: string
  username?: string
  email?: string
  role?: {
    _id?: string
    code?: string
    name?: string
    permissions?: string[]
  }
}
