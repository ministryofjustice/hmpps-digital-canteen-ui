import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import PinPhoneService from '../../services/pinPhoneService'

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

describe('GET /pin-phone/buy-credit', () => {
  it('should render buy-pin-phone-credit page', async () => {
    pinPhoneService.createCart.mockResolvedValue({ cartId: 'cart_01KZ8HJSJN77XAY04Y60VRSEAB' })
    await request(app).get('/pin-phone/buy-credit').expect(200).expect('Content-Type', /html/)

    const createCartRequest = { prisonId: 'HEI', offenderNo: 'id', firstName: 'FIRST', lastName: 'LAST' }
    expect(pinPhoneService.createCart).toHaveBeenCalledWith(createCartRequest)
  })
})

describe('POST /pin-phone/buy-credit', () => {
  it('should call createCart API and redirect to check-order-details', async () => {
    await request(app)
      .post('/pin-phone/buy-credit')
      .send({ amount: '10' })
      .expect(302)
      .expect('Location', '/pin-phone/check-order-details')

    expect(pinPhoneService.createCart).not.toHaveBeenCalled()
  })
})
