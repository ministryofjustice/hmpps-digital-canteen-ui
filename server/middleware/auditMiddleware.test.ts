import { EventEmitter } from 'events'
import type { Request, Response } from 'express'
import auditMiddleware, { AuditedRequest } from './auditMiddleware'
import AuditService, { AuditAction, AuditedUserGroup, AuditOutcome, Page, SubjectType } from '../services/auditService'
import { HmppsUser } from '../interfaces/hmppsUser'

jest.mock('../services/auditService')

const auditService = new AuditService(null) as jest.Mocked<AuditService>

const prisoner = { authSource: 'prisoner-auth', userId: 'A1234BC', username: 'A1234BC' } as HmppsUser
const staff = { authSource: 'nomis', userId: '1234', username: 'STAFF_USER' } as HmppsUser

const pageView: AuditedRequest = { action: AuditAction.VIEW, target: Page.CANTEEN_LANDING }
const prisonerEvent = { who: 'A1234BC', subjectId: 'A1234BC', subjectType: SubjectType.PRISONER_ID }

describe('auditMiddleware', () => {
  let req: Request
  let res: Response & EventEmitter
  const next = jest.fn()

  const sendRequest = async (user: HmppsUser, audited: AuditedRequest = pageView) => {
    const middleware = auditMiddleware(auditService, audited)
    res.locals.user = user
    await middleware.logAttempt(req, res, next)
    return middleware
  }

  const endResponse = (statusCode: number, writableFinished = true) => {
    Object.assign(res, { statusCode, writableFinished })
    res.emit('close')
  }

  const auditedOutcomes = () => auditService.logEvent.mock.calls.map(call => call[2])

  beforeEach(() => {
    req = { id: 'request-id', body: {} } as unknown as Request
    res = Object.assign(new EventEmitter(), { locals: {} }) as unknown as Response & EventEmitter
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('who and subject', () => {
    it('audits a prisoner as their username, against the prisoner audit queue, about their own data', async () => {
      await sendRequest(prisoner)

      expect(auditService.logEvent).toHaveBeenCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.ATTEMPT,
        { ...prisonerEvent, correlationId: 'request-id', details: undefined },
        AuditedUserGroup.PRISONER,
      )
      expect(next).toHaveBeenCalledWith()
    })

    it('audits staff as their username, against the staff audit queue, with no subject by default', async () => {
      await sendRequest(staff)

      expect(auditService.logEvent).toHaveBeenCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.ATTEMPT,
        {
          who: 'STAFF_USER',
          subjectId: 'NONE',
          subjectType: SubjectType.NOT_APPLICABLE,
          correlationId: 'request-id',
          details: undefined,
        },
        AuditedUserGroup.STAFF,
      )
    })

    it('audits the subject given for the request, e.g. the prisoner whose data a staff user views', async () => {
      req.params = { prisonerNumber: 'G1234HI' }
      await sendRequest(staff, {
        ...pageView,
        subject: request => ({
          subjectId: request.params.prisonerNumber as string,
          subjectType: SubjectType.PRISONER_ID,
        }),
      })

      expect(auditService.logEvent).toHaveBeenCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.ATTEMPT,
        expect.objectContaining({ who: 'STAFF_USER', subjectId: 'G1234HI', subjectType: SubjectType.PRISONER_ID }),
        AuditedUserGroup.STAFF,
      )
    })
  })

  describe('outcome', () => {
    it.each([200, 302])('audits success when the response ends with HTTP %s', async statusCode => {
      await sendRequest(prisoner)
      endResponse(statusCode)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.SUCCESS,
        { ...prisonerEvent, correlationId: 'request-id', details: undefined },
        AuditedUserGroup.PRISONER,
      )
    })

    it.each([400, 403, 404, 500])('audits failure when the response ends with HTTP %s', async statusCode => {
      await sendRequest(prisoner)
      endResponse(statusCode)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.FAILURE,
        {
          ...prisonerEvent,
          correlationId: 'request-id',
          details: { failureReason: `Responded with HTTP ${statusCode}` },
        },
        AuditedUserGroup.PRISONER,
      )
    })

    it('audits failure when the connection closes before the response is sent', async () => {
      await sendRequest(prisoner)
      endResponse(200, false)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.FAILURE,
        expect.objectContaining({ details: { failureReason: 'Connection closed before the response was sent' } }),
        AuditedUserGroup.PRISONER,
      )
    })

    it('audits failure with the error message when the handler fails, then passes the error on', async () => {
      const error = new Error('API unavailable')
      const { logError } = await sendRequest(prisoner)

      await logError(error, req, res, next)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.VIEW,
        Page.CANTEEN_LANDING,
        AuditOutcome.FAILURE,
        { ...prisonerEvent, correlationId: 'request-id', details: { failureReason: 'API unavailable' } },
        AuditedUserGroup.PRISONER,
      )
      expect(next).toHaveBeenLastCalledWith(error)
    })

    it('audits only one outcome, the first, for each request', async () => {
      const { logError } = await sendRequest(prisoner)
      await logError(new Error('API unavailable'), req, res, next)
      endResponse(500)

      expect(auditedOutcomes()).toEqual([AuditOutcome.ATTEMPT, AuditOutcome.FAILURE])
    })
  })

  describe('details', () => {
    const search: AuditedRequest = {
      action: AuditAction.SEARCH,
      target: 'PRODUCT',
      subject: request => ({ subjectId: request.body.term, subjectType: SubjectType.SEARCH_TERM }),
      details: request => ({ queryParams: { category: request.body.category } }),
    }

    beforeEach(() => {
      req.body = { term: 'crisps', category: 'food' }
    })

    it('sends the request details with the attempt', async () => {
      await sendRequest(prisoner, search)

      expect(auditService.logEvent).toHaveBeenCalledWith(
        AuditAction.SEARCH,
        'PRODUCT',
        AuditOutcome.ATTEMPT,
        {
          who: 'A1234BC',
          subjectId: 'crisps',
          subjectType: SubjectType.SEARCH_TERM,
          correlationId: 'request-id',
          details: { queryParams: { category: 'food' } },
        },
        AuditedUserGroup.PRISONER,
      )
    })

    it('sends the request details and the details the handler adds with the outcome', async () => {
      await sendRequest(prisoner, search)
      res.locals.auditDetails = { results: { resultCount: 2, returnedSubjectIds: ['P1', 'P2'] } }
      endResponse(200)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.SEARCH,
        'PRODUCT',
        AuditOutcome.SUCCESS,
        expect.objectContaining({
          details: {
            queryParams: { category: 'food' },
            results: { resultCount: 2, returnedSubjectIds: ['P1', 'P2'] },
          },
        }),
        AuditedUserGroup.PRISONER,
      )
    })

    it('sends the request details with the failure reason', async () => {
      await sendRequest(prisoner, search)
      endResponse(500)

      expect(auditService.logEvent).toHaveBeenLastCalledWith(
        AuditAction.SEARCH,
        'PRODUCT',
        AuditOutcome.FAILURE,
        expect.objectContaining({
          details: { queryParams: { category: 'food' }, failureReason: 'Responded with HTTP 500' },
        }),
        AuditedUserGroup.PRISONER,
      )
    })
  })
})
