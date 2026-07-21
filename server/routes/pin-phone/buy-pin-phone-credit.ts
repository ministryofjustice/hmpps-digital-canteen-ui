import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function buyPinPhoneCreditRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/buy-credit', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_LANDING, { who: res.locals.user.username, correlationId: req.id })

    // todo: hard coded values, will come from service later
    const userName = 'John'
    const pinPhoneCredit = '35.13'
    const spendsBalance = '47.00'
    const pinPhoneCreditLimit = '50.00'
    const creditBuyCapacity = '10.00'

    return res.render('pages/pin-phone/buy-pin-phone-credit', {
      userName,
      pinPhoneCredit,
      spendsBalance,
      pinPhoneCreditLimit,
      creditBuyCapacity,
    })
  })

  return router
}
