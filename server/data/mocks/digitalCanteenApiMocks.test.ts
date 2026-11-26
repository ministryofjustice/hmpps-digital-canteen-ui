import DigitalCanteenApiClient from '../digitalCanteenApiClient'
import mocks from './digitalCanteenApiMocks'
import catalogueData from './data/catalogue.json'

describe('digitalCanteenApiMocks', () => {
  it('has a mock for every DigitalCanteenApiClient endpoint', () => {
    const endpoints = Object.getOwnPropertyNames(DigitalCanteenApiClient.prototype).filter(
      name => name !== 'constructor',
    )

    expect(Object.keys(mocks).sort()).toEqual(endpoints.sort())
  })

  describe('product catalogue', () => {
    it('has the categories and product counts in the UCD designs', async () => {
      const { productCategories } = await mocks.getProductCategories.mock('HEI')

      expect(productCategories.map(category => [category.name, category.productCount])).toEqual([
        ['Batteries', 2],
        ['Biscuits and bakery', 15],
        ['Chilled and dairy', 23],
        ['Cleaning and laundry', 4],
        ['Soft drinks', 10],
        ['Fruit and vegetables', 12],
        ['Groceries', 21],
        ['Hot drinks', 10],
        ['Religious items', 10],
        ['Stamps, stationery and cards', 9],
        ['Sweets and snacks', 16],
        ['Tobacco and vaping', 15],
        ['Toiletries and health', 12],
      ])
      expect(productCategories[0]).toEqual({
        id: 'pcat_batteries',
        name: 'Batteries',
        handle: 'batteries',
        productCount: 2,
      })
    })

    it('returns a page of all products, sorted by title, with the total count', async () => {
      const { products, count, offset, limit } = await mocks.getProducts.mock({ prisonId: 'HEI', limit: 12, offset: 0 })

      expect({ count, offset, limit }).toEqual({ count: 159, offset: 0, limit: 12 })
      expect(products.map(product => product.title).slice(0, 4)).toEqual([
        '10p Postage Stamp',
        '1p Postage Stamp',
        '1st Class Stamp',
        '2nd Class Stamp',
      ])
      expect(products[0]).toEqual({
        id: 'prod_10p-postage-stamp',
        title: '10p Postage Stamp',
        handle: '10p-postage-stamp',
        description: '10p Postage Stamp',
        thumbnail: '/assets/images/products/placeholder.svg',
        metadata: { allergens: [] },
        variants: [
          { id: 'variant_10p-postage-stamp', calculatedPrice: { calculatedAmount: 0.1, currencyCode: 'gbp' } },
        ],
      })
    })

    it('returns the remaining products on the last page, and none after it', async () => {
      expect((await mocks.getProducts.mock({ prisonId: 'HEI', limit: 12, offset: 156 })).products).toHaveLength(3)
      expect((await mocks.getProducts.mock({ prisonId: 'HEI', limit: 12, offset: 168 })).products).toEqual([])
    })

    it("returns a category's products, with counts matching the category list", async () => {
      const { productCategories } = await mocks.getProductCategories.mock('HEI')

      const counts = await Promise.all(
        productCategories.map(async category => {
          const { count } = await mocks.getProducts.mock({
            prisonId: 'HEI',
            categoryId: category.id,
            limit: 1,
            offset: 0,
          })
          return [category.name, count]
        }),
      )
      expect(counts).toEqual(productCategories.map(category => [category.name, category.productCount]))
    })

    it('has unique product titles, as handles and ids are made from them', () => {
      const titles = catalogueData.categories.flatMap(category => category.products.map(product => product.title))
      expect(titles.filter((title, index) => titles.indexOf(title) !== index)).toEqual([])
    })

    it('only uses the 14 UK food allergens', () => {
      const ukAllergens = [
        'celery',
        'cereals containing gluten',
        'crustaceans',
        'eggs',
        'fish',
        'lupin',
        'milk',
        'molluscs',
        'mustard',
        'nuts',
        'peanuts',
        'sesame',
        'soya',
        'sulphites',
      ]
      const allergens = catalogueData.categories.flatMap(category => category.products.flatMap(p => p.allergens))
      expect(allergens.filter(allergen => !ukAllergens.includes(allergen))).toEqual([])
    })
  })

  describe('basket', () => {
    it('has products from the catalogue, at their prices, with consistent totals', async () => {
      const basket = await mocks.retrieveCurrentBasket.mock({ metadata: { offenderNo: 'A1234BC', cartId: null } })
      const { products } = await mocks.getProducts.mock({ prisonId: 'HEI', limit: 200, offset: 0 })

      basket.items.forEach(item => {
        const variant = products.flatMap(product => product.variants).find(v => v.id === item.variantId)
        expect(variant?.calculatedPrice.calculatedAmount).toEqual(item.unitPrice)
        expect(item.lineTotal).toBeCloseTo(item.unitPrice * item.quantity, 2)
      })
      expect(basket.itemCount).toEqual(basket.items.reduce((total, item) => total + item.quantity, 0))
      expect(basket.allItemsTotal).toBeCloseTo(
        basket.items.reduce((total, item) => total + item.lineTotal, 0),
        2,
      )
    })
  })

  it('returns new data on every call, so changing a response does not change later ones', async () => {
    const categories = await mocks.getProductCategories.mock('HEI')
    categories.productCategories.reverse()
    const page = await mocks.getProducts.mock({ prisonId: 'HEI', limit: 12, offset: 0 })
    page.products[0].title = 'Changed'
    const basket = await mocks.retrieveCurrentBasket.mock({ metadata: { offenderNo: 'A1234BC', cartId: null } })
    basket.items.pop()

    expect((await mocks.getProductCategories.mock('HEI')).productCategories[0].name).toEqual('Batteries')
    expect((await mocks.getProducts.mock({ prisonId: 'HEI', limit: 12, offset: 0 })).products[0].title).toEqual(
      '10p Postage Stamp',
    )
    expect(
      (await mocks.retrieveCurrentBasket.mock({ metadata: { offenderNo: 'A1234BC', cartId: null } })).items,
    ).toHaveLength(3)
  })

  it('returns a response from every endpoint', async () => {
    await expect(
      mocks.createMedusaUser.mock({ metadata: { prisonId: 'HEI', offenderNo: 'A1234BC' } }),
    ).resolves.toEqual({
      status: 'success',
    })
    await expect(
      mocks.addLineItems.mock({
        metadata: { prisonId: 'HEI', offenderNo: 'A1234BC', productVariantId: 'variant_x', cartId: null },
      }),
    ).resolves.toEqual({ cartId: 'cart_01MOCKBASKET' })
    await expect(
      mocks.removeLineItemFromBasket.mock({ metadata: { cartId: 'cart_1', lineItemId: 'item_1', quantity: 0 } }),
    ).resolves.toEqual({ cartId: 'cart_1' })
    await expect(mocks.removeBasket.mock({ metadata: { cartId: 'cart_1' } })).resolves.toEqual({ status: 'success' })
    await expect(
      mocks.evaluate.mock({ input: { productId: 'p', currentBalance: 0, creditLimit: 0, creditRequested: 0 } }),
    ).resolves.toEqual(expect.objectContaining({ result: expect.objectContaining({ decision: 'ALLOW' }) }))
    await expect(
      mocks.completePayment.mock('cart_1', { offenderNo: 'A1234BC', amountPence: 100, prisonId: 'HEI' }),
    ).resolves.toEqual(expect.objectContaining({ paymentSuccessful: true, cartId: 'cart_1' }))
    await expect(mocks.retrievePrisonerBalances.mock('A1234BC')).resolves.toEqual(
      expect.objectContaining({ prisoner: expect.objectContaining({ prisonerNumber: 'A1234BC' }) }),
    )
  })
})
