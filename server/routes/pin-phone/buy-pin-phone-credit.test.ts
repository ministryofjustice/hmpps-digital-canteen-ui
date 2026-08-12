import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import ERROR_MESSAGE from '../../constants/errorMessages'

jest.mock('../../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('POST /pin-phone/buy-credit', () => {
  it('should call createCart API and redirect to check-order-details', async () => {
    await request(app)
      .post('/pin-phone/buy-credit')
      .send({ amount: '1' })
      .expect(302)
      .expect('Location', '/pin-phone/check-order-details')
  })

  it('should render page when no amount is selected', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({})

    expect(response.status).toBe(200)
    expect(response.text).toContain(ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR)
  })

  it('should render page when other amount is empty', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: '',
    })

    expect(response.status).toBe(200)
    expect(response.text).toContain(ERROR_MESSAGE.RADIO_OPTION_NOT_SELECTED_ERROR)
  })

  it('should render page when custom amount contains letters', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: 'abc',
    })

    expect(response.status).toBe(200)
    expect(response.text).toContain(ERROR_MESSAGE.INVALID_AMOUNT_ERROR)
  })

  it('should render page when custom amount has more than 2 decimal places', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: '1.999',
    })

    expect(response.status).toBe(200)
    expect(response.text).toContain(ERROR_MESSAGE.INVALID_AMOUNT_ERROR)
  })

  it('should render page when maximum credit would be exceeded the spends amount', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: '78',
    })
    expect(response.text.replace(/&#39;/g, "'")).toContain(ERROR_MESSAGE.NOT_ENOUGH_SPEND_BALANCE_ERROR)
  })

  it('should render page when buying more than allowed credit', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: '16',
    })
    expect(response.text).toContain(ERROR_MESSAGE.CREDIT_LIMIT_EXCEEDED_ERROR)
  })
})
