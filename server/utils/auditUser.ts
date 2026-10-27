import { HmppsUser } from '../interfaces/hmppsUser'
import { AuditedUserGroup } from '../services/auditService'

export interface AuditUser {
  who: string
  userGroup: AuditedUserGroup
}

// Prisoners sign in via Launchpad and are identified by prisoner number, as their username is their full name.
// All other users are staff signed in via HMPPS Auth and are identified by their username.
export default function auditUserFor(user: HmppsUser): AuditUser {
  return user.authSource === 'prisoner-auth'
    ? { who: user.userId, userGroup: AuditedUserGroup.PRISONER }
    : { who: user.username, userGroup: AuditedUserGroup.STAFF }
}
