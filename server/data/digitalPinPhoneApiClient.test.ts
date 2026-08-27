import nock from 'nock'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import DigitalPinPhoneApiClient from './digitalPinPhoneApiClient'
import config from '../config'

describe('DigitalPinPhoneApiClient', () => {
  let digitalPinPhoneApiClient: DigitalPinPhoneApiClient
  let mockAuthenticationClient: jest.Mocked<AuthenticationClient>

  beforeEach(() => {
    mockAuthenticationClient = {
      getToken: jest.fn(),
    } as unknown as jest.Mocked<AuthenticationClient>

    digitalPinPhoneApiClient = new DigitalPinPhoneApiClient(mockAuthenticationClient)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  describe('createCart', () => {
    it('should make a POST request to /api/carts using system token', async () => {
      const token = 'test-system-token'
      mockAuthenticationClient.getToken.mockResolvedValue(token)

      const metadata = {
        prison_id: 'HEI',
        offender_no: 'A1234BC',
        first_name: 'John',
        second_name: 'Doe',
      }

      nock(config.apis.digitalCanteenApi.url)
        .post('/api/carts', { metadata })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { cart: { id: '123' } })

      const result = await digitalPinPhoneApiClient.createCart({ metadata })

      expect(nock.isDone()).toBe(true)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalled()
      expect(result.cart.id).toBe('123')
    })
  })

  describe('addPinPhoneLineItem', () => {
    it('should make a POST request to /api/add-line-item/{cartId} using system token', async () => {
      const token = 'test-system-token'
      mockAuthenticationClient.getToken.mockResolvedValue(token)

      const cartId = 'cart_123'
      const amount = 500

      nock(config.apis.digitalCanteenApi.url)
        .post(`/api/add-line-item/${cartId}`, { amount })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { cart: { id: cartId } })

      const result = await digitalPinPhoneApiClient.addPinPhoneLineItem(cartId, amount)

      expect(nock.isDone()).toBe(true)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalled()
      expect(result.cart.id).toBe(cartId)
    })
  })
})
