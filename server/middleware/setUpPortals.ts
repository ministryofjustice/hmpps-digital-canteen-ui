import express, { Request, RequestHandler, Router } from 'express'
import { PortalType } from '../@types/portalTypes'

export const isRequestForStaffPortal = (req: Request): boolean => req.hostname.startsWith('staff.')

export const portalsMiddleware: RequestHandler = (req, res, next) => {
  const portalType: PortalType = isRequestForStaffPortal(req) ? 'staff' : 'prisoner'

  req.portalType = portalType
  res.locals.isStaffPortal = portalType === 'staff'
  res.locals.isPrisonerPortal = portalType === 'prisoner'

  next()
}

export const requirePortal =
  (portalType: PortalType): RequestHandler =>
  (req, res, next) =>
    req.portalType === portalType ? next() : res.status(404).render('pages/error', { message: 'Page not found' })

export default function setUpPortals(): Router {
  const router = express.Router()
  router.use(portalsMiddleware)
  return router
}
