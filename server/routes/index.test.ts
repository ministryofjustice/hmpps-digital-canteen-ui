import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes, user } from './testutils/appSetup'
import routes from './index'
import AuditService, { AuditOutcome } from '../services/auditService'
import TelemetryService from '../services/telemetryService'
import type { Services } from '../services'

jest.mock('../services/auditService')
jest.mock('../services/telemetryService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>
const telemetryService = new TelemetryService() as jest.Mocked<TelemetryService>

// Routes that are not pages, so are not audited
const NOT_PAGES = ['GET /']

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    services: {
      auditService,
      telemetryService,
    },
    userSupplier: () => user,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should redirect to canteen', () => {
    return request(app).get('/').expect(302).expect('Location', '/canteen')
  })
})

describe('auditing', () => {
  const routerLayers = routes({ auditService, telemetryService } as unknown as Services).stack
  const pageRequests = routerLayers
    .flatMap(layer =>
      [...new Set(layer.route?.stack.map(handler => handler.method))].map(method => ({
        method,
        path: layer.route.path,
      })),
    )
    .filter(({ method, path }) => !NOT_PAGES.includes(`${method.toUpperCase()} ${path}`))

  it('finds the pages', () => {
    expect(pageRequests.length).toBeGreaterThan(0)
  })

  // Pages in a mounted router or middleware would not be checked below
  it('adds every route directly, not through a mounted router or middleware', () => {
    expect(routerLayers.filter(layer => !layer.route)).toEqual([])
  })

  // Fails for a page added without route() in routes/index.ts. Add it with route(), or to NOT_PAGES if it isn't a page
  it.each(pageRequests)('audits the attempt and outcome of $method $path', async ({ method, path }) => {
    await request(app)[method as 'get' | 'post'](path.replace(/:(\w+)/g, 'test-$1'))

    expect(auditService.logEvent).toHaveBeenCalledTimes(2)
    expect(auditService.logEvent.mock.calls.map(call => call[2])).toEqual([
      AuditOutcome.ATTEMPT,
      expect.stringMatching(new RegExp(`^(${AuditOutcome.SUCCESS}|${AuditOutcome.FAILURE})$`)),
    ])
  })
})
