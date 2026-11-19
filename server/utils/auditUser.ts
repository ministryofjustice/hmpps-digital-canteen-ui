import { HmppsUser } from '../interfaces/hmppsUser'
import { AuditedUserGroup } from '../services/auditService'

export interface AuditUser {
  who: string
  userGroup: AuditedUserGroup
}

// The HMPPS Audit `who` is the username. For prisoners, Launchpad sets it to the `sub` of their ID token, which is
// expected to be their prisoner number.
// Prisoners are audited to the prisoner audit queue, and staff signed in via HMPPS Auth to the staff audit queue.
export default function auditUserFor(user: HmppsUser): AuditUser {
  return {
    who: user.username,
    userGroup: user.authSource === 'prisoner-auth' ? AuditedUserGroup.PRISONER : AuditedUserGroup.STAFF,
  }
}
