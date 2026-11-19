import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import {
  AddLineItemsRequest,
  AddLineItemsResponse,
  CreateMedusaUserRequest,
  CreateDraftOrderRequest,
  GetBasketRequest,
  GetBasketResponse,
  PrisonerBalance,
  RemoveBasketRequest,
  RemoveLineItemFromBasketRequest,
  RemoveLineItemsResponse,
  CreateDraftOrderResponse,
  CancelDraftOrderRequest,
  GetDraftOrderResponse,
} from '../canteen.model'
import { PATHS } from '../constants/paths'

export default class DigitalCanteenApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Digital Canteen API', config.apis.digitalCanteenApi, logger, authenticationClient)
  }

  async createMedusaUser({ data }: CreateMedusaUserRequest): Promise<string> {
    return this.post(
      {
        path: PATHS.CREATE_MEDUSA_USER,
        data: { data },
      },
      asSystem(),
    )
  }

  async retrieveCurrentBasket({ data }: GetBasketRequest): Promise<GetBasketResponse> {
    return this.post(
      {
        path: PATHS.RETRIEVE_CURRENT_BASKET,
        data: { data },
      },
      asSystem(),
    )
  }

  async addLineItems({ data }: AddLineItemsRequest): Promise<AddLineItemsResponse> {
    return this.post(
      {
        path: PATHS.ADD_LINE_ITEM,
        data: { data },
      },
      asSystem(),
    )
  }

  async removeLineItemFromBasket({ data }: RemoveLineItemFromBasketRequest): Promise<RemoveLineItemsResponse> {
    return this.post(
      {
        path: PATHS.REMOVE_LINE_ITEM,
        data: { data },
      },
      asSystem(),
    )
  }

  async removeBasket({ data }: RemoveBasketRequest): Promise<string> {
    return this.post(
      {
        path: PATHS.REMOVE_BASKET,
        data: { data },
      },
      asSystem(),
    )
  }

  async retrievePrisonerBalances(prisonerNumber: string): Promise<PrisonerBalance> {
    return this.get(
      {
        path: `/api/prisoner-balance/${prisonerNumber}`,
      },
      asSystem(),
    )
  }

  async createDraftOrder(cartId: string, { data }: CreateDraftOrderRequest): Promise<CreateDraftOrderResponse> {
    return this.post(
      {
        path: `/api/create-draft-order/${cartId}`,
        data: { data },
      },
      asSystem(),
    )
  }

  async getOrder(orderId: string): Promise<GetDraftOrderResponse> {
    return this.get(
      {
        path: `/api/get-draft-order/${orderId}`,
      },
      asSystem(),
    )
  }

  async cancelDraftOrder({ data }: CancelDraftOrderRequest): Promise<string> {
    return this.post(
      {
        path: PATHS.CANCEL_DRAFT_ORDER,
        data: { data },
      },
      asSystem(),
    )
  }
}
