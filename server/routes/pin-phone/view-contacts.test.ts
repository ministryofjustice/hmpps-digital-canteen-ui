import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from '../testutils/appSetup'
import AuditService from '../../services/auditService'
import PinPhoneService from '../../services/pinPhoneService'
import { PATHS } from '../../constants/paths'
import { PrisonerContact } from '../../pinPhone.model'
import TelemetryService from '../../services/telemetryService'

jest.mock('../../services/auditService')
jest.mock('../../services/pinPhoneService')
jest.mock('../../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const pinPhoneService = new PinPhoneService(null) as jest.Mocked<PinPhoneService>
const telemetryService = { trackEvent: jest.fn() } as unknown as jest.Mocked<TelemetryService>


let app: Express

const contacts: PrisonerContact[] = [
  {
    prisonerId: 'A1234AA',
    id: 1,
    name: 'B Name',
    phoneNumber: '0123456789',
    controlStatus: true,
    callAllowed: true,
    legal: false,
    allowMonitor: true,
    alert: false,
    override: false,
    contactType: 'SOCIAL',
    contactTypeDescription: 'HUSBAND',
  },
  {
    prisonerId: 'A1234AA',
    id: 2,
    name: 'A Name',
    phoneNumber: '0987654321',
    controlStatus: true,
    callAllowed: true,
    legal: false,
    allowMonitor: true,
    alert: false,
    override: false,
    contactType: 'OFFICIAL',
    contactTypeDescription: 'Legal Representative',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      pinPhoneService,
      telemetryService,
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /pin-phone/view-contacts', () => {
  it('should render the view contacts page with contacts sorted by name', async () => {
    pinPhoneService.retrieveContacts.mockResolvedValue(contacts)

    const response = await request(app).get(PATHS.VIEW_CONTACTS)

    expect(response.status).toBe(200)
    expect(response.text).toContain('A Name')
    expect(response.text).toContain('0123456789')
    expect(response.text).toContain('Social')
    expect(response.text).toContain('Husband')
    expect(response.text).toContain('B Name')
    expect(response.text).toContain('0987654321')
    expect(response.text).toContain('Legal')
    expect(response.text).toContain('Legal Representative')
    expect(pinPhoneService.retrieveContacts).toHaveBeenCalledWith('id')
  })

  it('should render the view contacts page with "no contacts" message when no contacts exist', async () => {
    pinPhoneService.retrieveContacts.mockResolvedValue([])
    const response = await request(app).get(PATHS.VIEW_CONTACTS)

    expect(response.status).toBe(200)
    expect(response.text).toContain('You have no approved contacts at the moment.')
    expect(pinPhoneService.retrieveContacts).toHaveBeenCalledWith('id')
  })

  it('should handle pagination correctly', async () => {
    const manyContacts = Array.from({ length: 15 }, (_, i) => ({
      ...contacts[0],
      id: i,
      name: `Contact ${i.toString().padStart(2, '0')}`,
    }))
    pinPhoneService.retrieveContacts.mockResolvedValue(manyContacts)

    const responsePage0 = await request(app).get(`${PATHS.VIEW_CONTACTS}?page=0`)
    expect(responsePage0.status).toBe(200)
    expect(responsePage0.text).toContain('Contact 00')
    expect(responsePage0.text).toContain('Contact 09')
    expect(responsePage0.text).not.toContain('Contact 10')

    const responsePage1 = await request(app).get(`${PATHS.VIEW_CONTACTS}?page=1`)
    expect(responsePage1.status).toBe(200)
    expect(responsePage1.text).not.toContain('Contact 09')
    expect(responsePage1.text).toContain('Contact 10')
    expect(responsePage1.text).toContain('Contact 14')
  })
})
