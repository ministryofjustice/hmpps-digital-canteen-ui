import { Product } from '../canteen.model'
import type DigitalCanteenApiClient from '../data/digitalCanteenApiClient'
import { PATHS } from '../constants/paths'

// The API client calls this service needs
export type ProductCatalogueClient = Pick<DigitalCanteenApiClient, 'getProductCategories' | 'getProducts'>

export const PRODUCTS_PER_PAGE = 12

interface CategoryNavigationItem {
  text: string
  href: string
  active: boolean
}

interface ProductCard {
  title: string
  href: string
  imageUrl: string | null
  allergens: string
  price: string
  variantId: string | null
}

export interface ProductCatalogue {
  heading: string
  totalCount: number
  categoryNavigation: CategoryNavigationItem[]
  products: ProductCard[]
  page: number
  totalPages: number
  // The selected category's handle, if a known category is selected
  category?: string
}

export interface ProductCatalogueRequest {
  prisonId: string
  // Category handle from the URL, e.g. 'batteries'
  category?: string
  // 1-based page number from the URL
  page: number
}

const ALL_PRODUCTS = 'All products'

// The Canteen home page's URL for a category (by its handle) and page, e.g. /canteen?category=batteries&page=2
export const canteenHref = ({ category, page }: { category?: string; page?: number } = {}): string => {
  const query = new URLSearchParams({
    ...(category && { category }),
    ...(page && { page: page.toString() }),
  }).toString()
  return query ? `${PATHS.LANDING_PAGE}?${query}` : PATHS.LANDING_PAGE
}

export const formatPrice = (amount: number | undefined): string => (amount === undefined ? '' : `£${amount.toFixed(2)}`)

export const formatAllergens = (allergens: string[] | undefined): string =>
  allergens?.length ? `Contains: ${allergens.join(', ')}` : 'No allergens'

const toProductCard = (product: Product): ProductCard => {
  const variant = product.variants[0]
  return {
    title: product.title,
    href: `${PATHS.LANDING_PAGE}/products/${product.handle}`,
    imageUrl: product.thumbnail,
    allergens: formatAllergens(product.metadata?.allergens),
    price: formatPrice(variant?.calculatedPrice.calculatedAmount),
    variantId: variant?.id ?? null,
  }
}

export default class ProductCatalogueService {
  constructor(private readonly productCatalogueClient: ProductCatalogueClient) {}

  async getProductCatalogue({ prisonId, category, page }: ProductCatalogueRequest): Promise<ProductCatalogue> {
    const requestedPage = Number.isInteger(page) && page > 0 ? page : 1
    const getProducts = (categoryId?: string) =>
      this.productCatalogueClient.getProducts({
        prisonId,
        categoryId,
        limit: PRODUCTS_PER_PAGE,
        offset: (requestedPage - 1) * PRODUCTS_PER_PAGE,
      })

    // Without a category, the two requests are independent, so they're made at the same time. With one, the products
    // request needs the category's id from the categories
    const [{ productCategories }, allProducts] = await Promise.all([
      this.productCatalogueClient.getProductCategories(prisonId),
      category ? undefined : getProducts(),
    ])
    const selectedCategory = category
      ? productCategories.find(productCategory => productCategory.handle === category)
      : undefined
    const { products, count } = allProducts ?? (await getProducts(selectedCategory?.id))

    const allProductsCount = productCategories.reduce(
      (total, productCategory) => total + productCategory.productCount,
      0,
    )

    return {
      heading: selectedCategory?.name ?? ALL_PRODUCTS,
      totalCount: count,
      categoryNavigation: [
        { text: `${ALL_PRODUCTS} (${allProductsCount})`, href: canteenHref(), active: !selectedCategory },
        ...productCategories.map(productCategory => ({
          text: `${productCategory.name} (${productCategory.productCount})`,
          href: canteenHref({ category: productCategory.handle }),
          active: productCategory === selectedCategory,
        })),
      ],
      products: products.map(toProductCard),
      page: requestedPage,
      totalPages: Math.ceil(count / PRODUCTS_PER_PAGE),
      category: selectedCategory?.handle,
    }
  }
}
