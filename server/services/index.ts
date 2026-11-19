import { dataAccess } from '../data'
import AuditService from './auditService'
import CanteenService from './canteenService'
import TelemetryService from './telemetryService'
import MedusaBasketService from './medusaBasketService'

export const services = () => {
  const { applicationInfo, hmppsAuditClients, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClients),
    telemetryService: new TelemetryService(),
    canteenService: new CanteenService(digitalCanteenApiClient),
    medusaBasketService: new MedusaBasketService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
