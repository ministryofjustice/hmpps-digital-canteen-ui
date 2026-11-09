import { Router } from 'express'

import type { Services } from '../services'
import { PATHS } from '../constants/paths'
import { requirePortal } from '../middleware/setUpPortals'
import pageRoute from './pageRoute'
import CanteenLandingHandler from './handlers/canteenLandingHandler'
import StaffCanteenLandingHandler from './handlers/staffCanteenLandingHandler'

export default function routes({ auditService, telemetryService }: Services): Router {
  const router = Router()

  // Every page must be added with route(), so that every request to it is audited
  const route = pageRoute(router, auditService)

  // Not a page: redirects to the landing page for the portal
  router.get('/', async (req, res, _next) => {
    res.redirect(req.portalType === 'staff' ? PATHS.STAFF_LANDING_PAGE : PATHS.LANDING_PAGE)
  })

  // Prisoner portal routes
  route(PATHS.LANDING_PAGE, new CanteenLandingHandler(telemetryService))

  // Staff portal routes
  route(PATHS.STAFF_LANDING_PAGE, new StaffCanteenLandingHandler(telemetryService), requirePortal('staff'))

  return router
}
