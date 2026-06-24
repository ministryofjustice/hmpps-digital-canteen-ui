import MedusaApiClient from '../../data/api/medusaApiClient/client'

export default class MedusaService {
  constructor(private readonly medusaApiClient: MedusaApiClient) {}

  createCart() {
    return this.medusaApiClient.createCart('ASI', 'G8167UL', 'Auth', 'User')
  }

  addPinPhoneCreditToCart(cartId: string, amount: number) {
    return this.medusaApiClient.addPinPhoneCreditToCart(cartId, amount)
  }

  completeCart(cartId: string) {
    return this.medusaApiClient.completeCart(cartId)
  }
}
