import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import PinPhoneService from './pinPhoneService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    pinPhoneService: new PinPhoneService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
