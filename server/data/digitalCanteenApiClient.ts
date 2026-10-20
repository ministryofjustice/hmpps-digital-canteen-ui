import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import {
  CompleteCartResponse,
  CreateCartRequest,
  EnrichedPrisoner,
  PaymentRequest,
  PolicyEvaluation,
  PolicyResult,
} from '../canteen.model'
import { PATHS } from '../constants/paths'

export default class DigitalCanteenApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Digital Canteen API', config.apis.digitalCanteenApi, logger, authenticationClient)
  }

  async createCart({ metadata }: CreateCartRequest): Promise<{ cart: { id: string } }> {
    return this.post(
      {
        path: PATHS.CREATE_CART,
        data: { metadata },
      },
      asSystem(),
    )
  }

  async evaluate(policyEvaluation: PolicyEvaluation): Promise<PolicyResult> {
    return this.post(
      {
        path: `/api/opa/evaluate`,
        data: { ...policyEvaluation },
      },
      asSystem(),
    )
  }

  async retrievePrisonerBalances(prisonerNumber: string): Promise<EnrichedPrisoner> {
    return this.get(
      {
        path: `/api/prisoner-enrichment/${prisonerNumber}`,
      },
      asSystem(),
    )
  }

  async completePayment(cartId: string, paymentRequest: PaymentRequest): Promise<CompleteCartResponse> {
    return this.post(
      {
        path: `/api/carts/${cartId}/checkout`,
        data: { ...paymentRequest },
      },
      asSystem(),
    )
  }
}
