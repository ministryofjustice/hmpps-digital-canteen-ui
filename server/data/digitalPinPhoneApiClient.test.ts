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
      const offenderNo = 'A1234BC'
      const prisonId = 'HEI'
      const firstName = 'John'
      const lastName = 'Doe'

      mockAuthenticationClient.getToken.mockResolvedValue(token)

      nock(config.apis.digitalCanteenApi.url)
        .post('/api/carts', { prisonId, offenderNo, firstName, lastName })
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, { cartId: '123' })

      const result = await digitalPinPhoneApiClient.createCart({ prisonId, offenderNo, firstName, lastName })

      expect(nock.isDone()).toBe(true)
      expect(mockAuthenticationClient.getToken).toHaveBeenCalled()
      expect(result.cartId).toBe('123')
    })
  })
})
