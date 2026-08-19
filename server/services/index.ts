import { dataAccess } from '../data'
import AuditService from './auditService'
import PinPhoneService from './pinPhoneService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    pinPhoneService: new PinPhoneService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
