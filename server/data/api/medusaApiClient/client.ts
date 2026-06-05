import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../../config'

export interface MedusaCart {
  id: string
}

export interface CartResponse {
  cart: MedusaCart
}

export default class MedusaApiClient extends RestClient {
  private readonly apiKey: string

  constructor(authenticationClient: AuthenticationClient) {
    super('Medusa API', config.apis.medusaApi, console, authenticationClient)
    this.apiKey = config.apis.medusaApi.apiKey
  }

  private medusaHeaders() {
    return {
      'x-publishable-api-key': this.apiKey,
      'Content-Type': 'application/json',
    }
  }

  /**
   * create a cart within medusa
   * Endpoint: POST /store/carts
   * @param prisonId
   * @param offenderNo
   * @param firstName
   * @param secondName
   */
  async createCart(prisonId: string, offenderNo: string, firstName: string, secondName: string): Promise<CartResponse> {
    return this.post<CartResponse>(
      {
        path: '/store/carts',
        headers: this.medusaHeaders(),
        data: {
          metadata: {
            prison_id: prisonId,
            offender_no: offenderNo,
            first_name: firstName,
            second_name: secondName,
          },
        },
      },
      asSystem(),
    )
  }

  /**
   * create a cart within medusa
   * Endpoint: POST /store/carts
   * @param cartId
   * @param amount
   */
  async addPinPhoneCreditToCart(cartId: string, amount: number) {
    return this.post(
      {
        path: `/store/carts/${cartId}/line-items-credit`,
        headers: this.medusaHeaders(),
        data: {
          amount,
        },
      },
      asSystem(),
    )
  }

  /**
   * complete a cart within medusa
   * Endpoint: POST /store/complete
   * @param cartId
   */
  async completeCart(cartId: string) {
    return this.post(
      {
        path: `/store/carts/${cartId}/complete`,
        headers: this.medusaHeaders(),
      },
      asSystem(),
    )
  }
}
