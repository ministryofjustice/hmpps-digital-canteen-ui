import { DigitalCanteenApiClient } from '../data'
import { CreateCartRequest, PaymentRequest, PolicyEvaluation, PolicyResult } from '../canteen.model'

export default class CanteenService {
  constructor(private readonly digitalCanteenApiClient: DigitalCanteenApiClient) {}

  createCart(createCartRequest: CreateCartRequest) {
    return this.digitalCanteenApiClient.createCart(createCartRequest)
  }

  completePayment(cartId: string, paymentRequest: PaymentRequest) {
    return this.digitalCanteenApiClient.completePayment(cartId, paymentRequest)
  }
}
