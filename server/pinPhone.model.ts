export interface CreateCartRequest {
  prisonId: string
  offenderNo: string
  firstName: string
  lastName: string
}

export interface PrisonerContact {
  prisonerId: string
  id: number
  name: string
  phoneNumber: string
  controlStatus: boolean
  callAllowed: boolean
  legal: boolean
  allowMonitor: boolean
  alert: boolean
  override: boolean
  contactType: string
  contactTypeDescription: string
}
