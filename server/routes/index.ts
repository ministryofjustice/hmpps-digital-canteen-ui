import { Router } from 'express'

import type { Services } from '../services'
import pinPhoneRoutes from './pin-phone/pin-phone-landing'
import buyPinPhoneCreditRoutes from './pin-phone/buy-pin-phone-credit'
import checkOrderDetailsRoutes from './pin-phone/check-order-details'
import buyCreditConfirmation from './pin-phone/buy-credit-confirmation'
import viewContacts from './pin-phone/view-contacts'
import socialContact from './pin-phone/social-contact'
import officialContact from './pin-phone/official-contact'

export default function routes({ auditService, pinPhoneService }: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    res.redirect('/pin-phone')
  })

  pinPhoneRoutes(router, auditService)
  buyPinPhoneCreditRoutes(router, auditService, pinPhoneService)
  checkOrderDetailsRoutes(router, auditService)
  buyCreditConfirmation(router, auditService)
  viewContacts(router, auditService, pinPhoneService)
  socialContact(router, auditService)
  officialContact(router, auditService)
  return router
}
