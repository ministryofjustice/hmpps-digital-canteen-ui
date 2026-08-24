import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import PinPhoneService from '../../services/pinPhoneService'
import ERROR_MESSAGE from '../../constants/errorMessages'
import { CreateCartRequest } from '../../pinPhone.model'

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

  pinPhoneService.retrievePrisonerBalances.mockResolvedValue({
    prisoner: {
      prisonerNumber: 'XYZ',
      prisonId: '123',
      prisonName: 'Ashford',
      bookNumber: '123',
      bookingId: '123',
      dateOfBirth: '20/02/1990',
      youthOffender: false,
      gender: 'male',
    },
    prisonerBalance: { spendsPence: 10000, cashPence: 0, savingsPence: 0, damageObligationsPence: 0, currency: 'GBP' },
    prisonerBtBalance: {
      reference: 'XYZ123',
      prisonerId: 'XYZ',
      balancePence: 1000,
      creditLimitPence: 5000,
      isFn: false,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /pin-phone/buy-credit', () => {
  it('should render buy-pin-phone-credit page', async () => {
    pinPhoneService.createCart.mockResolvedValue({ cart: { id: 'cart_01KZ8HJSJN77XAY04Y60VRSEAB' } })
    await request(app).get('/pin-phone/buy-credit').expect(200).expect('Content-Type', /html/)

    const createCartRequest: CreateCartRequest = {
      metadata: {
        prison_id: 'HEI',
        offender_no: 'id',
        first_name: 'FIRST',
        second_name: 'LAST',
      },
    }
    expect(pinPhoneService.createCart).toHaveBeenCalledWith(createCartRequest)
  })
})

describe('Validations GET /pin-phone/buy-credit', () => {
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
      customAmount: '150',
    })
    expect(response.text.replace(/&#39;/g, "'")).toContain(ERROR_MESSAGE.NOT_ENOUGH_SPEND_BALANCE_ERROR)
  })

  it('should render page when buying more than allowed credit', async () => {
    const response = await request(app).post('/pin-phone/buy-credit').send({
      amount: 'other',
      customAmount: '45',
    })
    expect(response.text).toContain(ERROR_MESSAGE.CREDIT_LIMIT_EXCEEDED_ERROR)
  })

  it('should add line item when valid amount is selected', async () => {
    pinPhoneService.addPinPhoneLineItem.mockResolvedValue({ cart: { id: 'TEST_CART_ID' } })
    const response = await request(app).post('/pin-phone/buy-credit').send({ amount: '1.00' })
    expect(response.status).toBe(302)
  })
})
