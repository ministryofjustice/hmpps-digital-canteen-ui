export interface CreateMedusaUserRequest {
  data: {
    prisonId: string
    offenderNo: string
  }
}

export interface GetBasketRequest {
  data: {
    offenderNo: string
    cartId: string
  }
}

export interface GetBasketResponse {
  cartId: string
  items: [BasketLineItem]
  itemCount: number
  allItemsTotal: number
  draftOrderId: string
}

export interface BasketLineItem {
  lineItemId: string
  variantId: string
  title: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface AddLineItemsRequest {
  data: {
    prisonId: string
    offenderNo: string
    productVariantId: string
    cartId: string
    canteenWindowEnd: Date
  }
}

export interface AddLineItemsResponse {
  cartId: string
}

export interface RemoveLineItemFromBasketRequest {
  data: {
    cartId: string
    lineItemId: string
    quantity: number
  }
}

export interface RemoveLineItemsResponse {
  cartId: string
}

export interface RemoveBasketRequest {
  data: {
    cartId: string
  }
}

export interface GetDraftOrderResponse {
  hasDraftOrder: boolean
  items: [DraftOrderLineItem]
  itemCount: number
  subTotal: number
  total: number
}

export interface DraftOrderLineItem {
  title: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CreateDraftOrderRequest {
  data: {
    draftOrderId?: string
  }
}

export interface CreateDraftOrderResponse {
  draftOrderId: string
}

export interface CancelDraftOrderRequest {
  data: {
    draftOrderId: string
  }
}

export interface PrisonerBalance {
  spendsPence: number
  cashPence: number
  savingsPence: number
  damageObligationsPence: number
  currency: string
}

export interface PaymentRequest {
  offenderNo: string
  amountPence: number
  prisonId: string
}

export interface CompleteCartResponse {
  paymentSuccessful: boolean
  orderStatusRecorded: boolean
  orderId: string | null
  cartId: string
}
