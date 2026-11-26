import { dataAccess } from '../data'
import AuditService from './auditService'
import CanteenService from './canteenService'
import TelemetryService from './telemetryService'
import MedusaBasketService from './medusaBasketService'
import ProductCatalogueService from './productCatalogueService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    telemetryService: new TelemetryService(),
    canteenService: new CanteenService(digitalCanteenApiClient),
    medusaBasketService: new MedusaBasketService(digitalCanteenApiClient),
    productCatalogueService: new ProductCatalogueService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
