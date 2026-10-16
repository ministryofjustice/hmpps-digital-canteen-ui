import { Router } from 'express'

import type { Services } from '../services'
import canteenRoutes from './canteen-landing'

export default function routes({ auditService, telemetryService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    res.redirect('/canteen')
  })

  canteenRoutes(router, auditService, telemetryService)
  return router
}
