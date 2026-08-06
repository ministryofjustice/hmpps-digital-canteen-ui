import { DigitalPinPhoneApiClient } from '../data'
import { CreateCartRequest } from '../pinPhone.model'

export default class PinPhoneService {
  constructor(private readonly digitalPinPhoneApiClient: DigitalPinPhoneApiClient) {}

  createCart(createCartRequest: CreateCartRequest) {
    return this.digitalPinPhoneApiClient.createCart(createCartRequest)
  }
}
