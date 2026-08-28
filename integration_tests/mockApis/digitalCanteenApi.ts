import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/digitalCanteenApi/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubCreateCart: (cartId = 'TEST_CART_ID', httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/digitalCanteenApi/api/carts',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          cart: { id: cartId },
        },
      },
    }),

  stubAddLineItem: (httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/digitalCanteenApi/api/add-line-item/.*',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          cart: { id: 'TEST_CART_ID' },
        },
      },
    }),

  stubGetBalances: (prisonerNumber: string, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/digitalCanteenApi/api/prisoner-enrichment/${prisonerNumber}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
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
          prisonerBalance: {
            spendsPence: 10000,
            cashPence: 0,
            savingsPence: 0,
            damageObligationsPence: 0,
            currency: 'GBP',
          },
          prisonerBtBalance: {
            reference: 'XYZ123',
            prisonerId: 'XYZ',
            balancePence: 1000,
            creditLimitPence: 5000,
            isFn: false,
          },
        },
      },
    }),

  stubGetLessThan10Contacts: (prisonerNumber: string, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/digitalCanteenApi/api/prisoner-contacts/${prisonerNumber}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: smallContactList,
      },
    }),

  stubGetMoreThan10Contacts: (prisonerNumber: string, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/digitalCanteenApi/api/prisoner-contacts/${prisonerNumber}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: largeContactList,
      },
    }),

  stubGetNoContacts: (prisonerNumber: string, httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/digitalCanteenApi/api/prisoner-contacts/${prisonerNumber}`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: null,
      },
    }),

  stubCompletePayment: (cartId = 'TEST_CART_ID', httpStatus = 200): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/digitalCanteenApi/api/carts/${cartId}/checkout`,
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: {
          paymentSuccessful: true,
          orderStatusRecorded: true,
          orderId: 'order_123',
          cartId,
        },
      },
    }),

  stubCompletePaymentFailure: (cartId = 'TEST_CART_ID', httpStatus = 422): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/digitalCanteenApi/api/carts/${cartId}/checkout`,
      },
      response: {
        status: httpStatus,
      },
    }),
}

const smallContactList = [
  {
    prisonerId: 'XYZ',
    id: 162439,
    name: 'John Doe',
    phoneNumber: '07700900351',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Father',
  },
  {
    prisonerId: 'XYZ',
    id: 162440,
    name: 'Jane Smith',
    phoneNumber: '07700900352',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Mother',
  },
  {
    prisonerId: 'XYZ',
    id: 162441,
    name: 'Robert Brown',
    phoneNumber: '07700900353',
    controlStatus: true,
    callAllowed: true,
    legal: false,
    allowMonitor: true,
    alert: false,
    override: false,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Friend',
  },
  {
    prisonerId: 'XYZ',
    id: 162442,
    name: 'Sarah Williams',
    phoneNumber: '07700900354',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'OFFICIAL',
    contactTypeDescription: 'Solicitor',
  },
  {
    prisonerId: 'XYZ',
    id: 162443,
    name: 'Michael Jones',
    phoneNumber: '07700900355',
    controlStatus: true,
    callAllowed: false,
    legal: false,
    allowMonitor: true,
    alert: true,
    override: false,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Brother',
  },
]

const largeContactList = [
  ...smallContactList,
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162444,
    name: 'Alice Green',
    phoneNumber: '07700900356',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Daughter',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162445,
    name: 'Brian Harris',
    phoneNumber: '07700900357',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Husband',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162446,
    name: 'Carol Jackson',
    phoneNumber: '07700900358',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Wife',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162447,
    name: 'Derek King',
    phoneNumber: '07700900359',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Son',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162448,
    name: 'Eleanor Lewis',
    phoneNumber: '07700900360',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Grandmother',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162449,
    name: 'Frank Martin',
    phoneNumber: '07700900361',
    controlStatus: true,
    callAllowed: true,
    legal: true,
    allowMonitor: false,
    alert: true,
    override: true,
    contactType: 'SOCIAL',
    contactTypeDescription: 'Cousin',
  },
  {
    prisonerId: 'A-BOOKING-ID',
    id: 162450,
    name: 'Grace Nelson',
    phoneNumber: '07700900362',
    controlStatus: true,
    callAllowed: true,
    legal: false,
    allowMonitor: true,
    alert: false,
    override: false,
    contactType: 'PROFESSIONAL',
    contactTypeDescription: 'Probation Officer',
  },
]
