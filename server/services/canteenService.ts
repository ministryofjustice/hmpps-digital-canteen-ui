import { DigitalCanteenApiClient } from '../data'
import { CreateMedusaUserRequest, PaymentRequest } from '../canteen.model'

export default class CanteenService {
  constructor(private readonly digitalCanteenApiClient: DigitalCanteenApiClient) {}

  createMedusaUser(createMedusaUserRequest: CreateMedusaUserRequest) {
    return this.digitalCanteenApiClient.createMedusaUser(createMedusaUserRequest)
  }

  completePayment(cartId: string, paymentRequest: PaymentRequest) {
    return this.digitalCanteenApiClient.completePayment(cartId, paymentRequest)
  }
}
