import { dataAccess } from '../data'
import AuditService from './auditService'
import CanteenService from './canteenService'
import TelemetryService from './telemetryService'

export const services = () => {
  const { applicationInfo, hmppsAuditClients, digitalCanteenApiClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClients),
    telemetryService: new TelemetryService(),
    canteenService: new CanteenService(digitalCanteenApiClient),
  }
}

export type Services = ReturnType<typeof services>
