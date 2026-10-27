import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import auditUserFor from './auditUser'
import { HmppsUser } from '../interfaces/hmppsUser'
import { AuditedUserGroup } from '../services/auditService'

describe('auditUserFor', () => {
  it('identifies a Launchpad user as a prisoner by their prisoner number', () => {
    const user = { authSource: 'prisoner-auth', userId: 'A1234BC', username: 'John Smith' } as LaunchpadUser

    expect(auditUserFor(user)).toEqual({ who: 'A1234BC', userGroup: AuditedUserGroup.PRISONER })
  })

  it.each(['nomis', 'delius', 'external', 'azuread'])('identifies a %s user as staff by their username', authSource => {
    const user = { authSource, userId: '12345', username: 'STAFF_USER' } as HmppsUser

    expect(auditUserFor(user)).toEqual({ who: 'STAFF_USER', userGroup: AuditedUserGroup.STAFF })
  })
})
