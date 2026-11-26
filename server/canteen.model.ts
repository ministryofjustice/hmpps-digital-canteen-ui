export interface CreateMedusaUserRequest {
  metadata: {
    prisonId: string
    offenderNo: string
  }
}

export interface GetBasketRequest {
  metadata: {
    offenderNo: string
    cartId: string
  }
}

export interface GetBasketResponse {
  cartId: string
  items: BasketLineItem[]
  itemCount: number
  allItemsTotal: number
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
  metadata: {
    prisonId: string
    offenderNo: string
    productVariantId: string
    cartId: string
  }
}

export interface AddLineItemsResponse {
  cartId: string
}

export interface RemoveLineItemFromBasketRequest {
  metadata: {
    cartId: string
    lineItemId: string
    quantity: number
  }
}

export interface RemoveLineItemsResponse {
  cartId: string
}

// The response of create-medusa-user and remove-basket
export interface StatusResponse {
  status: string
}

export interface RemoveBasketRequest {
  metadata: {
    cartId: string
  }
}

export interface PolicyEvaluation {
  input: {
    productId: string
    currentBalance: number
    creditLimit: number
    creditRequested: number
  }
}

export interface PolicyResult {
  result: {
    hidden: boolean
    decision: 'ALLOW' | 'DENY'
    creditLimit: number
    maxAvailableCredit: number
    warnings: string[]
  }
}

export interface PrisonerContact {
  prisonerId: string
  id: number
  name: string
  phoneNumber: string
  controlStatus: boolean
  callAllowed: boolean
  legal: boolean
  allowMonitor: boolean
  alert: boolean
  override: boolean
  contactType: string
  contactTypeDescription: string
}

export interface EnrichedPrisoner {
  prisoner: PrisonerSearchResponse
  prisonerBalance: BalanceResponse | null
}

export interface PrisonerSearchResponse {
  prisonerNumber: string
  prisonId: string | null
  prisonName: string | null
  bookNumber: string | null
  bookingId: string | null
  dateOfBirth: string | null
  youthOffender: boolean | null
  gender: string | null
}

export interface BalanceResponse {
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

/*
 * Product catalogue: the proposed Digital Canteen API contract, to agree with the API team. Based on Medusa's store API
 * (GET /store/product-categories and GET /store/products), with camelCase field names
 */
export interface ProductCategory {
  id: string
  name: string
  handle: string
  // Not returned by Medusa: the Digital Canteen API is expected to add it
  productCount: number
}

export interface ProductCategoriesResponse {
  productCategories: ProductCategory[]
}

export interface ProductVariant {
  id: string
  // In pounds, e.g. 0.63. Medusa v2 amounts are not in pence
  calculatedPrice: {
    calculatedAmount: number
    currencyCode: string
  }
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  metadata: {
    // Not a Medusa field: stored in product metadata until the allergen data model is agreed
    allergens?: string[]
  } | null
  variants: ProductVariant[]
}

export interface ProductsRequest {
  prisonId: string
  categoryId?: string
  limit: number
  offset: number
}

export interface ProductsResponse {
  products: Product[]
  count: number
  offset: number
  limit: number
}
