import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express'
import request from 'supertest'
import pageRoute from './pageRoute'
import { PageHandler } from './interfaces/pageHandler'
import AuditService, { AuditAction, AuditedUserGroup, AuditOutcome, Page, SubjectType } from '../services/auditService'
import { HmppsUser } from '../interfaces/hmppsUser'

jest.mock('../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

const staff = { authSource: 'nomis', username: 'STAFF_USER' } as HmppsUser

const appWith = (handler: PageHandler, ...guards: RequestHandler[]): Express => {
  const app = express()
  app.use(express.urlencoded({ extended: true }))
  app.use((req, res, next) => {
    req.id = 'request-id'
    res.locals.user = staff
    next()
  })
  const router = express.Router()
  pageRoute(router, auditService)('/orders/:orderId', handler, ...guards)
  app.use(router)
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).send(error.message)
  })
  return app
}

const page = (overrides: Partial<PageHandler> = {}): PageHandler => ({
  PAGE_NAME: Page.STAFF_CANTEEN_LANDING,
  GET: async (_req, res) => {
    res.send('page')
  },
  ...overrides,
})

const auditedEvents = () =>
  auditService.logEvent.mock.calls.map(([action, target, outcome, details]) => ({
    what: `${action}_${target}_${outcome}`,
    subjectId: details.subjectId,
    subjectType: details.subjectType,
    details: details.details,
  }))

afterEach(() => {
  jest.resetAllMocks()
})

describe('pageRoute', () => {
  it('audits each view of the page', async () => {
    await request(appWith(page())).get('/orders/order-1').expect(200)

    expect(auditedEvents().map(event => event.what)).toEqual([
      'VIEW_STAFF_CANTEEN_LANDING_ATTEMPT',
      'VIEW_STAFF_CANTEEN_LANDING_SUCCESS',
    ])
    expect(auditService.logEvent).toHaveBeenCalledWith(
      AuditAction.VIEW,
      Page.STAFF_CANTEEN_LANDING,
      AuditOutcome.ATTEMPT,
      expect.objectContaining({ who: 'STAFF_USER', correlationId: 'request-id' }),
      AuditedUserGroup.STAFF,
    )
  })

  it("audits the page's own subject, e.g. the prisoner whose data a staff page shows", async () => {
    const handler = page({ auditSubject: () => ({ subjectId: 'G1234HI', subjectType: SubjectType.PRISONER_ID }) })

    await request(appWith(handler)).get('/orders/order-1').expect(200)

    expect(auditedEvents()).toEqual([
      expect.objectContaining({ subjectId: 'G1234HI', subjectType: SubjectType.PRISONER_ID }),
      expect.objectContaining({ subjectId: 'G1234HI', subjectType: SubjectType.PRISONER_ID }),
    ])
  })

  it('calls a handler written with class methods, which use `this`, as the handler', async () => {
    class PrisonerOrdersHandler implements PageHandler {
      private readonly prisonerNumber = 'G1234HI'

      public PAGE_NAME = Page.STAFF_CANTEEN_LANDING

      async GET(_req: Request, res: Response) {
        res.send(`orders for ${this.prisonerNumber}`)
      }

      auditSubject() {
        return { subjectId: this.prisonerNumber, subjectType: SubjectType.PRISONER_ID }
      }
    }

    const res = await request(appWith(new PrisonerOrdersHandler())).get('/orders/order-1').expect(200)

    expect(res.text).toEqual('orders for G1234HI')
    expect(auditedEvents()).toEqual([
      expect.objectContaining({ what: 'VIEW_STAFF_CANTEEN_LANDING_ATTEMPT', subjectId: 'G1234HI' }),
      expect.objectContaining({ what: 'VIEW_STAFF_CANTEEN_LANDING_SUCCESS', subjectId: 'G1234HI' }),
    ])
  })

  it('audits a view that a guard rejects as a failure', async () => {
    const guard: RequestHandler = (_req, res) => {
      res.status(404).send('Access denied')
    }

    await request(appWith(page(), guard)).get('/orders/order-1').expect(404)

    expect(auditedEvents().map(event => event.what)).toEqual([
      'VIEW_STAFF_CANTEEN_LANDING_ATTEMPT',
      'VIEW_STAFF_CANTEEN_LANDING_FAILURE',
    ])
  })

  describe('form submissions', () => {
    const redirectAfterPost = async (_req: Request, res: Response) => res.redirect('/orders')

    it('audits creating', async () => {
      const handler = page({
        POST: redirectAfterPost,
        POST_AUDIT: { action: AuditAction.CREATE, target: 'ORDER' },
      })

      await request(appWith(handler)).post('/orders/order-1').expect(302)

      expect(auditedEvents().map(event => event.what)).toEqual(['CREATE_ORDER_ATTEMPT', 'CREATE_ORDER_SUCCESS'])
    })

    it('audits editing, with the entity and the changed fields', async () => {
      const handler = page({
        POST: redirectAfterPost,
        POST_AUDIT: {
          action: AuditAction.EDIT,
          target: 'ORDER',
          details: req => ({
            entityId: req.params.orderId as string,
            changes: [{ field: 'quantity', newValue: req.body.quantity }],
          }),
        },
      })

      await request(appWith(handler)).post('/orders/order-1').type('form').send({ quantity: '3' }).expect(302)

      const details = { entityId: 'order-1', changes: [{ field: 'quantity', newValue: '3' }] }
      expect(auditedEvents()).toEqual([
        expect.objectContaining({ what: 'EDIT_ORDER_ATTEMPT', details }),
        expect.objectContaining({ what: 'EDIT_ORDER_SUCCESS', details }),
      ])
    })

    it('audits deleting', async () => {
      const handler = page({
        POST: redirectAfterPost,
        POST_AUDIT: {
          action: AuditAction.DELETE,
          target: 'ORDER',
          details: req => ({ entityId: req.params.orderId as string }),
        },
      })

      await request(appWith(handler)).post('/orders/order-1').expect(302)

      expect(auditedEvents()).toEqual([
        expect.objectContaining({ what: 'DELETE_ORDER_ATTEMPT', details: { entityId: 'order-1' } }),
        expect.objectContaining({ what: 'DELETE_ORDER_SUCCESS', details: { entityId: 'order-1' } }),
      ])
    })

    it('audits searching, about the search term, with the search parameters and the results', async () => {
      const handler = page({
        POST: async (_req, res) => {
          res.locals.auditDetails = { results: { resultCount: 1, returnedSubjectIds: ['A1234BC'] } }
          res.send('results')
        },
        POST_AUDIT: {
          action: AuditAction.SEARCH,
          target: 'PRISONER',
          subject: req => ({ subjectId: req.body.term, subjectType: SubjectType.SEARCH_TERM }),
          details: req => ({ queryParams: { location: req.body.location } }),
        },
      })

      await request(appWith(handler)).post('/orders/order-1').type('form').send({ term: 'A1234BC', location: 'BMI' })

      expect(auditedEvents()).toEqual([
        {
          what: 'SEARCH_PRISONER_ATTEMPT',
          subjectId: 'A1234BC',
          subjectType: SubjectType.SEARCH_TERM,
          details: { queryParams: { location: 'BMI' } },
        },
        {
          what: 'SEARCH_PRISONER_SUCCESS',
          subjectId: 'A1234BC',
          subjectType: SubjectType.SEARCH_TERM,
          details: { queryParams: { location: 'BMI' }, results: { resultCount: 1, returnedSubjectIds: ['A1234BC'] } },
        },
      ])
    })

    it('audits a submission that fails validation, or errors, as a failure with the reason', async () => {
      const handler = page({
        POST: async () => {
          throw new Error('Quantity must be a number')
        },
        POST_AUDIT: { action: AuditAction.EDIT, target: 'ORDER' },
      })

      await request(appWith(handler)).post('/orders/order-1').expect(500)

      expect(auditedEvents()).toEqual([
        expect.objectContaining({ what: 'EDIT_ORDER_ATTEMPT' }),
        expect.objectContaining({
          what: 'EDIT_ORDER_FAILURE',
          details: { failureReason: 'Quantity must be a number' },
        }),
      ])
    })

    it('refuses a page with a POST but no POST_AUDIT, so form submissions are never unaudited', () => {
      expect(() => appWith(page({ POST: redirectAfterPost }))).toThrow(
        'STAFF_CANTEEN_LANDING has a POST without POST_AUDIT, so its form submissions would not be audited',
      )
    })
  })
})
