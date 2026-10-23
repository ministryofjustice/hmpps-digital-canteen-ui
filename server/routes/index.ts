import { Router } from 'express'

import type { Services } from '../services'
import canteenRoutes from './canteen-landing'
import staffCanteenRoutes from './staff-canteen-landing'
import { PATHS } from '../constants/paths'
import { requirePortal } from '../middleware/setUpPortals'

export default function routes({ auditService, telemetryService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    res.redirect(req.portalType === 'staff' ? PATHS.STAFF_LANDING_PAGE : PATHS.LANDING_PAGE)
  })

  // Prisoner portal routes
  canteenRoutes(router, auditService, telemetryService)

  // Staff portal routes
  staffCanteenRoutes(router, auditService, telemetryService, requirePortal('staff'))

  return router
}
