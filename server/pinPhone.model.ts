export interface CreateCartRequest {
  metadata: {
    prison_id: string
    offender_no: string
    first_name: string
    second_name: string
  }
}

export interface PolicyEvaluation {
  input: {
    productId: string
    currentBalance: number
    creditLimit: number
  }
}

export interface PolicyResult {
  result: {
    hidden: boolean
    decision: 'ALLOW' | 'DENY'
    provider: string | null
    productId: string | null
    prisonId: string | null
    creditLimitEnabled: boolean
    creditLimit: number
    currentBalance: number
    maxAvailableCredit: number
    accountSource: string[]
    warnings: string[]
    errors: string[]
  }
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

export interface PaymentRequest {
  offenderNo: string
  amountPence: number
  prisonId: string
}

export interface CompleteCartResponse {
  paymentSuccessful: boolean
  orderStatusRecorded: boolean
  orderId: string | null
  cartId: string
}
