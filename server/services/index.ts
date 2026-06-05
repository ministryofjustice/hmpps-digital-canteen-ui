import { dataAccess } from '../data'
import AuditService from './auditService'
import ExampleService from './exampleService'
import MedusaService from './medusa/MedusaService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, exampleApiClient, medusaApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    exampleService: new ExampleService(exampleApiClient),
    medusaService: new MedusaService(medusaApiClient),
  }
}

export type Services = ReturnType<typeof services>
