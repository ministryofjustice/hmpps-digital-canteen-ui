import { Request, Response } from 'express'
import { portalsMiddleware, requirePortal } from './setUpPortals'

const newRes = () => ({ locals: {}, status: jest.fn().mockReturnThis(), render: jest.fn() }) as unknown as Response

describe('setupPortals middleware', () => {
  describe('when the user is on the staff portal', () => {
    const hostname = 'staff.digital-canteen-ui.prison.justice.gov.uk'

    let req: Request
    let res: Response
    let next: jest.Mock

    beforeEach(() => {
      req = { hostname, originalUrl: `https://${hostname}` } as Request
      res = { locals: {} } as Response
      next = jest.fn()
    })

    it('sets isStaffPortal to true', () => {
      portalsMiddleware(req, res, next)
      expect(res.locals.isStaffPortal).toBe(true)
    })

    it('sets isPrisonerPortal to false', () => {
      portalsMiddleware(req, res, next)
      expect(res.locals.isPrisonerPortal).toBe(false)
    })

    it('requirePortal passes matching staff portal', () => {
      req.portalType = 'staff'
      requirePortal('staff')(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('requirePortal 404s when prisoner tries staff routes', () => {
      req.portalType = 'prisoner'
      const staffRes = newRes()
      requirePortal('staff')(req, staffRes, next)
      expect(next).not.toHaveBeenCalled()
      expect(staffRes.status).toHaveBeenCalledWith(404)
    })
  })

  describe('when the user is on the prisoner portal', () => {
    const hostname = 'digital-canteen-ui.prison.justice.gov.uk'

    let req: Request
    let res: Response
    let next: jest.Mock

    beforeEach(() => {
      req = { hostname, originalUrl: `https://${hostname}` } as Request
      res = { locals: {} } as Response
      next = jest.fn()
    })

    it('sets isPrisonerPortal to true', () => {
      portalsMiddleware(req, res, next)
      expect(res.locals.isPrisonerPortal).toBe(true)
    })

    it('sets isStaffPortal to false', () => {
      portalsMiddleware(req, res, next)
      expect(res.locals.isStaffPortal).toBe(false)
    })

    it('requirePortal passes matching prisoner portal', () => {
      req.portalType = 'prisoner'
      requirePortal('prisoner')(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
