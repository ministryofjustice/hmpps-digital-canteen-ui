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
})
