import { DigitalPinPhoneApiClient } from '../data'
import { CreateCartRequest, PaymentRequest } from '../pinPhone.model'

export default class PinPhoneService {
  constructor(private readonly digitalPinPhoneApiClient: DigitalPinPhoneApiClient) {}

  createCart(createCartRequest: CreateCartRequest) {
    return this.digitalPinPhoneApiClient.createCart(createCartRequest)
  }

  retrieveContacts(prisonerNumber: string) {
    return this.digitalPinPhoneApiClient.retrieveContacts(prisonerNumber)
  }

  retrievePrisonerBalances(prisonerNumber: string) {
    return this.digitalPinPhoneApiClient.retrievePrisonerBalances(prisonerNumber)
  }

  addPinPhoneLineItem(cartId: string, creditAmount: number) {
    return this.digitalPinPhoneApiClient.addPinPhoneLineItem(cartId, creditAmount)
  }

  completePayment(cartId: string, paymentRequest: PaymentRequest) {
    return this.digitalPinPhoneApiClient.completePayment(cartId, paymentRequest)
  }
}
