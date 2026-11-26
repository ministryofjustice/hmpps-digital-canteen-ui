import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import AuditService from '../services/auditService'
import TelemetryService from '../services/telemetryService'
import ProductCatalogueService, { ProductCatalogueClient } from '../services/productCatalogueService'
import digitalCanteenApiMocks from '../data/mocks/digitalCanteenApiMocks'
import { HmppsUser } from '../interfaces/hmppsUser'

jest.mock('../services/auditService')
jest.mock('../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const telemetryService = new TelemetryService() as jest.Mocked<TelemetryService>
// The mock API responses' catalogue (13 categories and 159 products), so the tests use the same data as dev
const mockProductCatalogueClient = (): ProductCatalogueClient => ({
  getProductCategories: digitalCanteenApiMocks.getProductCategories.mock,
  getProducts: digitalCanteenApiMocks.getProducts.mock,
})
const productCatalogueService = new ProductCatalogueService(mockProductCatalogueClient())

const prisonerUser = { ...user, idToken: { name: 'John Smith' } } as unknown as HmppsUser

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: { auditService, telemetryService, productCatalogueService },
    userSupplier: () => prisonerUser,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

const getPage = async (url: string): Promise<string> => (await request(app).get(url).expect(200)).text

const textOf = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&ctdot;/g, '⋯')
    .replace(/\s+/g, ' ')
    .trim()

const categoryItems = (html: string) =>
  [...html.matchAll(/<li class="moj-side-navigation__item([^"]*)"[^>]*>\s*<a href="([^"]*)"([^>]*)>([^<]*)<\/a>/g)].map(
    ([, classes, href, attributes, text]) => ({
      text: text.trim(),
      href: href.replace(/&amp;/g, '&'),
      active: classes.includes('--active') && attributes.includes('aria-current="location"'),
    }),
  )

const productCards = (html: string): string[] => html.match(/<li class="app-product-card"[\s\S]*?<\/li>/g) ?? []

const paginationItems = (html: string) =>
  [...html.matchAll(/<li class="govuk-pagination__item([^"]*)">([\s\S]*?)<\/li>/g)].map(([, classes, content]) => {
    const text = textOf(content)
    return classes.includes('--current') ? `[${text}]` : text
  })

const linkHref = (html: string, className: string) =>
  html.match(new RegExp(`class="${className}"[\\s\\S]*?href="([^"]*)"`))?.[1]?.replace(/&amp;/g, '&')

const productsHeading = (html: string) => textOf(html.match(/<h2[^>]*id="products-heading"[^>]*>([\s\S]*?)<\/h2>/)[1])

describe('GET /canteen product catalogue', () => {
  describe('categories', () => {
    it('has a Categories heading for screen readers', async () => {
      const html = await getPage('/canteen')

      expect(html).toMatch(/<h2 class="moj-side-navigation__title govuk-visually-hidden">\s*Categories\s*<\/h2>/)
    })

    it('lists All products, then each category with its count, with All products active', async () => {
      const items = categoryItems(await getPage('/canteen'))

      expect(items).toHaveLength(14)
      expect(items.slice(0, 3)).toEqual([
        { text: 'All products (159)', href: '/canteen', active: true },
        { text: 'Batteries (2)', href: '/canteen?category=batteries', active: false },
        { text: 'Biscuits and bakery (15)', href: '/canteen?category=biscuits-and-bakery', active: false },
      ])
      expect(items.at(-1).text).toEqual('Toiletries and health (12)')
    })

    it('shows the selected category as active, and its products', async () => {
      const html = await getPage('/canteen?category=batteries')

      expect(categoryItems(html).filter(item => item.active)).toEqual([
        { text: 'Batteries (2)', href: '/canteen?category=batteries', active: true },
      ])
      expect(productsHeading(html)).toEqual('Batteries (2)')
      expect(productCards(html)).toHaveLength(2)
    })
  })

  describe('products', () => {
    it('shows the All products header with the total count, and the first 12 products', async () => {
      const html = await getPage('/canteen')

      expect(productsHeading(html)).toEqual('All products (159)')
      expect(productCards(html)).toHaveLength(12)
    })

    it('shows each product with its image, title link, allergens, price and add to basket button', async () => {
      const card = productCards(await getPage('/canteen'))[0]

      expect(card).toContain(
        '<img class="app-product-card__image" src="/assets/images/products/placeholder.svg" alt=""',
      )
      expect(card).toMatch(
        /<a class="govuk-link app-product-card__link" href="\/canteen\/products\/10p-postage-stamp"[^>]*>10p Postage Stamp<\/a>/,
      )
      expect(card).toMatch(/data-qa="product-allergens">No allergens</)
      expect(card).toMatch(/data-qa="product-price">£0.10</)
      expect(card).toMatch(/<button type="button"[^>]*data-variant-id="variant_10p-postage-stamp"/)
      expect(textOf(card.match(/<button[\s\S]*?<\/button>/)[0])).toEqual('Add to basket 10p Postage Stamp')
    })

    it("shows a product's allergens", async () => {
      const cards = productCards(await getPage('/canteen?category=sweets-and-snacks'))

      const chocolate = cards.find(card => card.includes('Milk Chocolate Bar'))
      expect(chocolate).toMatch(/data-qa="product-allergens">Contains: milk, soya</)
    })
  })

  describe('pagination', () => {
    it('links the pages, and the next page, from the first page', async () => {
      const html = await getPage('/canteen')

      expect(paginationItems(html)).toEqual(['[1]', '2', '⋯', '14'])
      expect(linkHref(html, 'govuk-pagination__next')).toEqual('/canteen?page=2')
      expect(html).not.toContain('govuk-pagination__prev')
    })

    it('shows the requested page', async () => {
      const html = await getPage('/canteen?page=14')

      expect(productCards(html)).toHaveLength(3)
      expect(paginationItems(html)).toEqual(['1', '⋯', '13', '[14]'])
      expect(linkHref(html, 'govuk-pagination__prev')).toEqual('/canteen?page=13')
      expect(html).not.toContain('govuk-pagination__next')
    })

    it('keeps the selected category in the page links', async () => {
      const html = await getPage('/canteen?category=chilled-and-dairy')

      expect(linkHref(html, 'govuk-pagination__next')).toEqual('/canteen?category=chilled-and-dairy&page=2')
    })

    it.each([
      ['/canteen?page=99', '/canteen?page=14'],
      ['/canteen?category=batteries&page=5', '/canteen?category=batteries&page=1'],
    ])('redirects %s, past the last page, to the last page', async (url, lastPage) => {
      await request(app).get(url).expect(302).expect('Location', lastPage)
    })

    it('is not shown when there is only one page', async () => {
      const html = await getPage('/canteen?category=batteries')

      expect(html).not.toContain('govuk-pagination')
    })
  })
})

describe('GET /canteen when the product catalogue is unavailable', () => {
  // As the API's errors are: e.g. a 404 while the product endpoints aren't built
  const apiError = (status: number) =>
    Object.assign(new Error(status === 404 ? 'Not Found' : 'Forbidden'), { responseStatus: status })

  const appWithCatalogue = (catalogueClient: ProductCatalogueClient) =>
    appWithAllRoutes({
      services: {
        auditService,
        telemetryService,
        productCatalogueService: new ProductCatalogueService(catalogueClient),
      },
      userSupplier: () => prisonerUser,
    })

  it.each([
    [
      'the products endpoint returns 404',
      { ...mockProductCatalogueClient(), getProducts: () => Promise.reject(apiError(404)) },
    ],
    [
      'the categories endpoint returns 403',
      { ...mockProductCatalogueClient(), getProductCategories: () => Promise.reject(apiError(403)) },
    ],
    ['the API times out', { ...mockProductCatalogueClient(), getProducts: () => Promise.reject(new Error('Timeout')) }],
  ])('still shows the rest of the page, with a message in place of the products, when %s', async (_when, client) => {
    const html = await request(appWithCatalogue(client))
      .get('/canteen')
      .expect(200)
      .then(res => res.text)

    expect(html).toContain('data-qa="product-catalogue-unavailable"')
    expect(textOf(html)).toContain("Products can't be shown at the moment")
    expect(html).not.toContain('data-qa="product-catalogue"')
    expect(html).not.toContain('govuk-pagination')
    // The rest of the page
    expect(textOf(html)).toContain("John Smith's Canteen")
    expect(html).toContain('class="order-summary"')
    expect(html).toContain('id="search"')
  })
})
