import { Router } from 'express'

import type { Services } from '../services'
import launchpadRoutes from './pin-phone/fake-launchpad'
import pinPhoneRoutes from './pin-phone/pin-phone-landing'
import buyPinPhoneCreditRoutes from './pin-phone/buy-pin-phone-credit'

export default function routes({ auditService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    res.redirect('/launchpad')
  })

  launchpadRoutes(router)
  pinPhoneRoutes(router, auditService)
  buyPinPhoneCreditRoutes(router, auditService)
  return router
}
