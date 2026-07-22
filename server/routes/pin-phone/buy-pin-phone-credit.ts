import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function buyPinPhoneCreditRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/buy-credit', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CREDITS, { who: res.locals.user.username, correlationId: req.id })

    // todo: hard coded values, will come from service later
    const pinPhoneCredit = '35.13'
    const spendsBalance = '47.00'
    const pinPhoneCreditLimit = '50.00'
    const creditBuyCapacity = '10.00'

    return res.render('pages/pin-phone/buy-pin-phone-credit', {
      pinPhoneCredit,
      spendsBalance,
      pinPhoneCreditLimit,
      creditBuyCapacity,
    })
  })
  router.post('/pin-phone/buy-credit', async (req, res) => {
    let { amount } = req.body
    if (amount === 'other') {
      amount = req.body.customAmount
    }
    console.log(amount)
    req.session.amount = amount
    // return res.redirect('/pin-phone/check-order-details')
  })

  return router
}
