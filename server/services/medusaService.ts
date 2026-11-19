import {
  AddLineItemsRequest,
  CancelDraftOrderRequest,
  CreateDraftOrderRequest,
  GetBasketRequest,
  RemoveBasketRequest,
  RemoveLineItemFromBasketRequest,
} from '../canteen.model'
import { DigitalCanteenApiClient } from '../data'

export default class MedusaService {
  constructor(private readonly digitalCanteenApiClient: DigitalCanteenApiClient) {}

  retrieveCurrentBasket(getBasketRequest: GetBasketRequest) {
    return this.digitalCanteenApiClient.retrieveCurrentBasket(getBasketRequest)
  }

  addItemsToBasket(addLineItemsRequest: AddLineItemsRequest) {
    return this.digitalCanteenApiClient.addLineItems(addLineItemsRequest)
  }

  removeLineItemFromBasket(removeLineItemFromBasketRequest: RemoveLineItemFromBasketRequest) {
    return this.digitalCanteenApiClient.removeLineItemFromBasket(removeLineItemFromBasketRequest)
  }

  removeBasket(removeBasketRequest: RemoveBasketRequest) {
    return this.digitalCanteenApiClient.removeBasket(removeBasketRequest)
  }

  createDraftOrder(cartId: string, createDraftOrderRequest: CreateDraftOrderRequest) {
    return this.digitalCanteenApiClient.createDraftOrder(cartId, createDraftOrderRequest)
  }

  getOrder(orderId: string) {
    return this.digitalCanteenApiClient.getOrder(orderId)
  }

  cancelDraftOrder(cancelDraftOrderRequest: CancelDraftOrderRequest) {
    return this.digitalCanteenApiClient.cancelDraftOrder(cancelDraftOrderRequest)
  }
}
