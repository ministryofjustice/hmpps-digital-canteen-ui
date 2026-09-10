import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import PinPhoneService from '../../services/pinPhoneService'
import errorMessages from '../../constants/errorMessages'

jest.mock('../../services/auditService')
jest.mock('../../services/pinPhoneService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const pinPhoneService = new PinPhoneService(null) as jest.Mocked<PinPhoneService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      pinPhoneService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('checkOrderDetailsRoutes', () => {
  describe('GET /pin-phone/check-order-details', () => {
    it('should render check-order-details page', async () => {
      const response = await request(app).get('/pin-phone/check-order-details').set('Cookie', ['session=...'])
      expect(response.status).toBe(200)
      expect(response.text).toContain('Check order details')
    })
  })

  describe('POST /pin-phone/check-order-details', () => {
    beforeEach(() => {
      pinPhoneService.retrievePrisonerBalances.mockResolvedValue({
        prisoner: {
          prisonerNumber: 'ABC1234',
          prisonId: 'HEI',
          prisonName: 'XYZ',
          bookNumber: 'A1234BC',
          bookingId: '123456',
          dateOfBirth: '1990-01-01',
          youthOffender: false,
          gender: 'Male',
        },
        prisonerBalance: {
          spendsPence: 1000,
          cashPence: 0,
          savingsPence: 0,
          damageObligationsPence: 0,
          currency: 'GBP',
        },
        prisonerBtBalance: {
          reference: 'REF123',
          prisonerId: 'ABC1234',
          balancePence: 500,
          creditLimitPence: 5000,
          isFn: false,
        },
      })
    })

    it('should complete payment and redirect if policy decision is ALLOW', async () => {
      pinPhoneService.evaluateRules.mockResolvedValue({
        result: {
          hidden: false,
          decision: 'ALLOW',
          provider: null,
          productId: null,
          prisonId: null,
          creditLimitEnabled: false,
          creditLimit: 5000,
          currentBalance: 500,
          maxAvailableCredit: 4500,
          accountSource: [],
          warnings: [],
          errors: [],
        },
      })

      const response = await request(app).post('/pin-phone/check-order-details').send({ _csrf: 'dummy' })

      expect(pinPhoneService.evaluateRules).toHaveBeenCalled()
      expect(pinPhoneService.completePayment).toHaveBeenCalled()
      expect(response.status).toBe(302)
      expect(response.header.location).toBe('/pin-phone/buy-credit-confirmation')
    })

    it('should not complete payment and show error if policy decision is DENY', async () => {
      pinPhoneService.evaluateRules.mockResolvedValue({
        result: {
          hidden: false,
          decision: 'DENY',
          provider: null,
          productId: null,
          prisonId: null,
          creditLimitEnabled: false,
          creditLimit: 5000,
          currentBalance: 500,
          maxAvailableCredit: 4500,
          accountSource: [],
          warnings: [],
          errors: [],
        },
      })

      const response = await request(app).post('/pin-phone/check-order-details').send({ _csrf: 'dummy' })

      expect(pinPhoneService.evaluateRules).toHaveBeenCalled()
      expect(pinPhoneService.completePayment).not.toHaveBeenCalled()
      expect(response.status).toBe(200)
      expect(response.text).toContain(errorMessages.POLICY_EVALUATION_ERROR)
      expect(response.text).toContain('href="#')
    })
  })
})
