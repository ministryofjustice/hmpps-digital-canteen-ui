import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import {
  AddLineItemsRequest,
  AddLineItemsResponse,
  CompleteCartResponse,
  CreateMedusaUserRequest,
  EnrichedPrisoner,
  GetBasketRequest,
  GetBasketResponse,
  PaymentRequest,
  PolicyEvaluation,
  PolicyResult,
  RemoveBasketRequest,
  RemoveLineItemFromBasketRequest,
  RemoveLineItemsResponse,
} from '../canteen.model'
import { PATHS } from '../constants/paths'

export default class DigitalCanteenApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Digital Canteen API', config.apis.digitalCanteenApi, logger, authenticationClient)
  }

  async createMedusaUser({ metadata }: CreateMedusaUserRequest): Promise<string> {
    return this.post(
      {
        path: PATHS.CREATE_MEDUSA_USER,
        data: { metadata },
      },
      asSystem(),
    )
  }

  async retrieveCurrentBasket({ metadata }: GetBasketRequest): Promise<GetBasketResponse> {
    return this.post(
      {
        path: PATHS.RETRIEVE_CURRENT_BASKET,
        data: { metadata },
      },
      asSystem(),
    )
  }

  async addLineItems({ metadata }: AddLineItemsRequest): Promise<AddLineItemsResponse> {
    return this.post(
      {
        path: PATHS.ADD_LINE_ITEM,
        data: { metadata },
      },
      asSystem(),
    )
  }

  async removeLineItemFromBasket({ metadata }: RemoveLineItemFromBasketRequest): Promise<RemoveLineItemsResponse> {
    return this.post(
      {
        path: PATHS.REMOVE_LINE_ITEM,
        data: { metadata },
      },
      asSystem(),
    )
  }

  async removeBasket({ metadata }: RemoveBasketRequest): Promise<string> {
    return this.post(
      {
        path: PATHS.REMOVE_BASKET,
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
