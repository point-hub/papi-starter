export interface IAuditLog {
  _id?: string
  operation_id?: string
  entity_type?: string
  entity_id?: string
  entity_ref?: string
  actor_type?: string
  actor_id?: string
  actor_name?: string
  action?: string
  module?: string
  system_reason?: string
  user_reason?: string
  changes?: {
    summary?: {
      fields?: string[]
      count?: number
    }
    snapshot?: {
      before?: object
      after?: object
    }
  }
  metadata?: {
    ip?: string
    device?: {
      type?: string
      model?: string
      vendor?: string
    }
    browser?: {
      type?: string
      name?: string
      version?: string
    }
    os?: {
      name?: string
      version?: string
    }
  }
  created_at?: Date
}
