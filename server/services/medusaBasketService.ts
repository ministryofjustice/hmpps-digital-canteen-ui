import {
  AddLineItemsRequest,
  GetBasketRequest,
  RemoveBasketRequest,
  RemoveLineItemFromBasketRequest,
} from '../canteen.model'
import { DigitalCanteenApiClient } from '../data'

export default class MedusaBasketService {
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
}
