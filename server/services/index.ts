import { dataAccess } from '../data'
import AuditService from './auditService'
import CanteenService from './canteenService'
import TelemetryService from './telemetryService'
import MedusaService from './medusaService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    telemetryService: new TelemetryService(),
    canteenService: new CanteenService(digitalCanteenApiClient),
    medusaBasketService: new MedusaService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
