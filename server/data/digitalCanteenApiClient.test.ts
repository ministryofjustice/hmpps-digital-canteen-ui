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
})
