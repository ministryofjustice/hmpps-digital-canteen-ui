import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import DigitalCanteenApiClient from './digitalCanteenApiClient'
import config from '../config'

describe('DigitalCanteenApiClient', () => {
  let digitalPinPhoneApiClient: DigitalCanteenApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn(),
    } as unknown as jest.Mocked<AuthenticationClient>

    digitalPinPhoneApiClient = new DigitalCanteenApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('createUser', () => {
    it('should make a POST request to /api/create-medusa-user', async () => {
      const token = 'test-system-token'
      mockAuthenticationClient.getToken.mockResolvedValue(token)

      const metadata = {
        offenderNo: 'A1234BC',
        prisonId: '12345',
      }

      nock(config.apis.digitalCanteenApi.url)
        .post('/api/create-medusa-user', { metadata })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { status: 'success' })

      const result = await digitalPinPhoneApiClient.createMedusaUser({ metadata })

      expect(nock.isDone()).toBe(true)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
    })
  })

  describe('getProductCategories', () => {
    it("should make a GET request to /api/product-categories for the prisoner's prison", async () => {
      const token = 'test-system-token'
      mockAuthenticationClient.getToken.mockResolvedValue(token)
      const response = {
        productCategories: [{ id: 'pcat_batteries', name: 'Batteries', handle: 'batteries', productCount: 2 }],
      }

      nock(config.apis.digitalCanteenApi.url)
        .get('/api/product-categories')
        .query({ prisonId: 'HEI' })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const result = await digitalPinPhoneApiClient.getProductCategories('HEI')

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual(response)
    })
  })

  describe('getProducts', () => {
    const response = { products: [] as never[], count: 0, offset: 12, limit: 12 }

    it('should make a GET request to /api/products for a page of all products', async () => {
      mockAuthenticationClient.getToken.mockResolvedValue('test-system-token')

      nock(config.apis.digitalCanteenApi.url)
        .get('/api/products')
        .query({ prisonId: 'HEI', limit: '12', offset: '12' })
        .reply(200, response)

      const result = await digitalPinPhoneApiClient.getProducts({ prisonId: 'HEI', limit: 12, offset: 12 })

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual(response)
    })

    it("should request a category's products", async () => {
      mockAuthenticationClient.getToken.mockResolvedValue('test-system-token')

      nock(config.apis.digitalCanteenApi.url)
        .get('/api/products')
        .query({ prisonId: 'HEI', categoryId: 'pcat_batteries', limit: '12', offset: '0' })
        .reply(200, response)

      await digitalPinPhoneApiClient.getProducts({
        prisonId: 'HEI',
        categoryId: 'pcat_batteries',
        limit: 12,
        offset: 0,
      })

      expect(nock.isDone()).toBe(true)
    })
  })
})
