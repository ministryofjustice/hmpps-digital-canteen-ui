import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import auditUserFor from './auditUser'
import { HmppsUser } from '../interfaces/hmppsUser'
import { AuditedUserGroup } from '../services/auditService'

describe('auditUserFor', () => {
  it('audits a Launchpad user to the prisoner audit queue as their username', () => {
    const user = { authSource: 'prisoner-auth', username: 'A1234BC', displayName: 'John Smith' } as LaunchpadUser

    expect(auditUserFor(user)).toEqual({ who: 'A1234BC', userGroup: AuditedUserGroup.PRISONER })
  })

  it.each(['nomis', 'delius', 'external', 'azuread'])(
    'audits a %s user to the staff audit queue as their username',
    authSource => {
      const user = { authSource, userId: '12345', username: 'STAFF_USER' } as HmppsUser

      expect(auditUserFor(user)).toEqual({ who: 'STAFF_USER', userGroup: AuditedUserGroup.STAFF })
    },
  )
})
