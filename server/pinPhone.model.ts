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

export interface EnrichedPinPhonePrisoner {
  prisoner: PrisonerSearchResponse
  prisonerBalance: BalanceResponse | null
  prisonerBtBalance: BtPinPhoneResponse | null
}

export interface PrisonerSearchResponse {
  prisonerNumber: string
  prisonId: string | null
  prisonName: string | null
  bookNumber: string | null
  bookingId: string | null
  dateOfBirth: string | null
  youthOffender: boolean | null
  gender: string | null
}

export interface BalanceResponse {
  spendsPence: number
  cashPence: number
  savingsPence: number
  damageObligationsPence: number
  currency: string
}

export interface BtPinPhoneResponse {
  reference: string
  prisonerId: string
  balancePence: number
  creditLimitPence: number
  isFn: boolean
}
