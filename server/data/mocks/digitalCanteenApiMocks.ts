import type { RestClient } from '@ministryofjustice/hmpps-rest-client'
import type DigitalCanteenApiClient from '../digitalCanteenApiClient'
import {
  CompleteCartResponse,
  EnrichedPrisoner,
  GetBasketResponse,
  PolicyResult,
  Product,
  ProductCategoriesResponse,
  ProductsResponse,
} from '../../canteen.model'
import catalogueData from './data/catalogue.json'
import basketData from './data/basket.json'

/*
 * A mock of every Digital Canteen API endpoint the UI calls, matching the real API's responses.
 *
 * The rule: every endpoint has a mock. For a UI-only ticket, add the mock with realEndpointReady: false. For an
 * integration ticket, check the mock exists and matches the real endpoint, then set realEndpointReady: true.
 *
 * Which is used, the mock or the real endpoint, is decided by withMocks: see server/data/mocks/README.md
 */

// One per endpoint: the client's own public methods, not the HTTP helpers (get, post...) it inherits from RestClient
type ApiMethods = {
  [Name in Exclude<keyof DigitalCanteenApiClient, keyof RestClient>]: DigitalCanteenApiClient[Name]
}

interface EndpointMock<Method> {
  // false: the real API doesn't have this endpoint yet, so the mock is used everywhere except preprod and prod.
  // Set to true in the integration ticket, once the real endpoint is in dev
  realEndpointReady: boolean
  // The same signature as the real method, so the mock must match the real API's types
  mock: Method
}

type ApiMocks = { [Name in keyof ApiMethods]: EndpointMock<ApiMethods[Name]> }

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const categoryIdOf = (handle: string) => `pcat_${handle}`

// The catalogue as the API returns it: products sorted by title, each with its category's id
const catalogue = (() => {
  const products = catalogueData.categories
    .flatMap(category =>
      category.products.map(({ title, price, allergens }) => {
        const handle = slugify(title)
        const product: Product = {
          id: `prod_${handle}`,
          title,
          handle,
          description: title,
          thumbnail: '/assets/images/products/placeholder.svg',
          metadata: { allergens },
          variants: [{ id: `variant_${handle}`, calculatedPrice: { calculatedAmount: price, currencyCode: 'gbp' } }],
        }
        return { categoryId: categoryIdOf(category.handle), product }
      }),
    )
    .sort((a, b) => a.product.title.localeCompare(b.product.title, 'en'))

  const productCategories = catalogueData.categories.map(category => ({
    id: categoryIdOf(category.handle),
    name: category.name,
    handle: category.handle,
    productCount: category.products.length,
  }))

  return { products, productCategories }
})()

const basket: GetBasketResponse = basketData

// A copy of the mock data, as a real API returns new data on every call, so a caller can't change it for later calls
const copy = <T>(data: T): T => structuredClone(data)

const digitalCanteenApiMocks: ApiMocks = {
  // Product catalogue: CRC-894 is UI only, so the real endpoints don't exist yet

  getProductCategories: {
    realEndpointReady: false,
    mock: async (): Promise<ProductCategoriesResponse> => ({ productCategories: copy(catalogue.productCategories) }),
  },

  getProducts: {
    realEndpointReady: false,
    mock: async ({ categoryId, limit, offset }): Promise<ProductsResponse> => {
      const products = catalogue.products
        .filter(entry => !categoryId || entry.categoryId === categoryId)
        .map(entry => entry.product)
      return { products: copy(products.slice(offset, offset + limit)), count: products.length, offset, limit }
    },
  },

  // Customer and basket

  createMedusaUser: {
    realEndpointReady: true,
    mock: async () => ({ status: 'success' }),
  },

  retrieveCurrentBasket: {
    realEndpointReady: true,
    mock: async () => copy(basket),
  },

  addLineItems: {
    realEndpointReady: true,
    mock: async () => ({ cartId: basket.cartId }),
  },

  removeLineItemFromBasket: {
    realEndpointReady: true,
    mock: async ({ metadata }) => ({ cartId: metadata.cartId }),
  },

  removeBasket: {
    realEndpointReady: true,
    mock: async () => ({ status: 'success' }),
  },

  // Checkout

  evaluate: {
    realEndpointReady: true,
    mock: async (): Promise<PolicyResult> => ({
      result: { decision: 'ALLOW', hidden: false, creditLimit: 5000, maxAvailableCredit: 5000, warnings: [] },
    }),
  },

  // POST /api/carts/{cartId}/checkout was removed from the API in CRC-842, and hasn't been replaced yet
  completePayment: {
    realEndpointReady: false,
    mock: async (cartId): Promise<CompleteCartResponse> => ({
      paymentSuccessful: true,
      orderStatusRecorded: true,
      orderId: 'order_01MOCKORDER',
      cartId,
    }),
  },

  // Prisoner

  retrievePrisonerBalances: {
    realEndpointReady: true,
    mock: async (prisonerNumber): Promise<EnrichedPrisoner> => ({
      prisoner: {
        prisonerNumber,
        prisonId: 'HEI',
        prisonName: 'Hewell (HMP)',
        bookNumber: '38412A',
        bookingId: '1102345',
        dateOfBirth: '1990-02-20',
        youthOffender: false,
        gender: 'Male',
      },
      prisonerBalance: {
        spendsPence: 3000,
        cashPence: 1250,
        savingsPence: 5000,
        damageObligationsPence: 0,
        currency: 'GBP',
      },
    }),
  },
}

export default digitalCanteenApiMocks
