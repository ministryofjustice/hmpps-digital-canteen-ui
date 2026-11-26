import ProductCatalogueService, {
  canteenHref,
  formatAllergens,
  formatPrice,
  ProductCatalogueClient,
  PRODUCTS_PER_PAGE,
} from './productCatalogueService'
import { Product, ProductCategory } from '../canteen.model'

const categories: ProductCategory[] = [
  { id: 'pcat_batteries', name: 'Batteries', handle: 'batteries', productCount: 2 },
  { id: 'pcat_stamps', name: 'Stamps, stationery and cards', handle: 'stamps', productCount: 9 },
]

const stamp: Product = {
  id: 'prod_1',
  title: '1st Class Stamp',
  handle: '1st-class-stamp',
  description: '1st Class Stamp',
  thumbnail: '/assets/images/products/stamp.png',
  metadata: { allergens: [] },
  variants: [{ id: 'variant_1', calculatedPrice: { calculatedAmount: 0.63, currencyCode: 'gbp' } }],
}

describe('ProductCatalogueService', () => {
  let client: jest.Mocked<ProductCatalogueClient>
  let service: ProductCatalogueService

  beforeEach(() => {
    client = {
      getProductCategories: jest.fn().mockResolvedValue({ productCategories: categories }),
      getProducts: jest.fn().mockResolvedValue({ products: [stamp], count: 11, offset: 0, limit: PRODUCTS_PER_PAGE }),
    }
    service = new ProductCatalogueService(client)
  })

  describe('with no category selected', () => {
    it('requests the first page of all products for the prison', async () => {
      await service.getProductCatalogue({ prisonId: 'HEI', page: 1 })

      expect(client.getProductCategories).toHaveBeenCalledWith('HEI')
      expect(client.getProducts).toHaveBeenCalledWith({
        prisonId: 'HEI',
        categoryId: undefined,
        limit: PRODUCTS_PER_PAGE,
        offset: 0,
      })
    })

    it('shows all products, with the total count', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page: 1 })

      expect(catalogue.heading).toEqual('All products')
      expect(catalogue.totalCount).toEqual(11)
      expect(catalogue.category).toBeUndefined()
    })

    it('lists All products first, then each category with its count, with All products active', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page: 1 })

      expect(catalogue.categoryNavigation).toEqual([
        { text: 'All products (11)', href: '/canteen', active: true },
        { text: 'Batteries (2)', href: '/canteen?category=batteries', active: false },
        { text: 'Stamps, stationery and cards (9)', href: '/canteen?category=stamps', active: false },
      ])
    })

    it('maps each product to a card', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page: 1 })

      expect(catalogue.products).toEqual([
        {
          title: '1st Class Stamp',
          href: '/canteen/products/1st-class-stamp',
          imageUrl: '/assets/images/products/stamp.png',
          allergens: 'No allergens',
          price: '£0.63',
          variantId: 'variant_1',
        },
      ])
    })
  })

  describe('with a category selected', () => {
    it('requests the products in that category, and makes it active', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', category: 'batteries', page: 1 })

      expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'pcat_batteries' }))
      expect(catalogue.heading).toEqual('Batteries')
      expect(catalogue.category).toEqual('batteries')
      expect(catalogue.categoryNavigation.filter(item => item.active).map(item => item.text)).toEqual(['Batteries (2)'])
    })

    it('shows all products for an unknown category', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', category: 'unknown', page: 1 })

      expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: undefined }))
      expect(catalogue.heading).toEqual('All products')
      expect(catalogue.category).toBeUndefined()
    })
  })

  describe('paging', () => {
    it('requests the products for the page', async () => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page: 3 })

      expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ offset: 2 * PRODUCTS_PER_PAGE }))
      expect(catalogue.page).toEqual(3)
    })

    it.each([0, -1, Number.NaN])('requests the first page for page %s', async page => {
      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page })

      expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ offset: 0 }))
      expect(catalogue.page).toEqual(1)
    })

    it.each([
      [0, 0],
      [12, 1],
      [13, 2],
      [159, 14],
    ])('has %s products on %s pages', async (count, totalPages) => {
      client.getProducts.mockResolvedValue({ products: [], count, offset: 0, limit: PRODUCTS_PER_PAGE })

      const catalogue = await service.getProductCatalogue({ prisonId: 'HEI', page: 1 })

      expect(catalogue.totalPages).toEqual(totalPages)
    })
  })
})

describe('requests', () => {
  const categoriesResponse = { productCategories: [categories[0]] }
  const productsResponse = { products: [] as Product[], count: 0, offset: 0, limit: PRODUCTS_PER_PAGE }

  it('without a category, requests the categories and products at the same time', async () => {
    let returnCategories: (value: typeof categoriesResponse) => void
    const categoriesReturned = new Promise<typeof categoriesResponse>(resolve => {
      returnCategories = resolve
    })
    const client: jest.Mocked<ProductCatalogueClient> = {
      getProductCategories: jest.fn().mockReturnValue(categoriesReturned),
      getProducts: jest.fn().mockResolvedValue(productsResponse),
    }

    const catalogue = new ProductCatalogueService(client).getProductCatalogue({ prisonId: 'HEI', page: 1 })

    // Products are requested before the categories have returned
    expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: undefined }))
    returnCategories(categoriesResponse)
    await catalogue
    expect(client.getProducts).toHaveBeenCalledTimes(1)
  })

  it("with a category, requests the products with the category's id from the categories", async () => {
    const client: jest.Mocked<ProductCatalogueClient> = {
      getProductCategories: jest.fn().mockResolvedValue(categoriesResponse),
      getProducts: jest.fn().mockResolvedValue(productsResponse),
    }

    await new ProductCatalogueService(client).getProductCatalogue({ prisonId: 'HEI', category: 'batteries', page: 1 })

    expect(client.getProducts).toHaveBeenCalledTimes(1)
    expect(client.getProducts).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 'pcat_batteries' }))
  })
})

describe('canteenHref', () => {
  it.each([
    [{}, '/canteen'],
    [{ category: 'batteries' }, '/canteen?category=batteries'],
    [{ page: 2 }, '/canteen?page=2'],
    [{ category: 'batteries', page: 2 }, '/canteen?category=batteries&page=2'],
    [{ category: 'tea & coffee' }, '/canteen?category=tea+%26+coffee'],
  ])('builds the URL for %j', (params, expected) => {
    expect(canteenHref(params)).toEqual(expected)
  })
})

describe('formatPrice', () => {
  it.each([
    [0.1, '£0.10'],
    [0.01, '£0.01'],
    [3.5, '£3.50'],
    [12, '£12.00'],
    [undefined, ''],
  ])('formats %s as %s', (amount, expected) => {
    expect(formatPrice(amount)).toEqual(expected)
  })
})

describe('formatAllergens', () => {
  it.each([
    [undefined, 'No allergens'],
    [[], 'No allergens'],
    [['milk'], 'Contains: milk'],
    [['milk', 'nuts'], 'Contains: milk, nuts'],
  ])('formats %j as %s', (allergens, expected) => {
    expect(formatAllergens(allergens)).toEqual(expected)
  })
})
