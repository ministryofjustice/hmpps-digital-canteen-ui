import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import validateBuyCreditInput from '../../utils/validateBuyCreditInput'

export default function buyPinPhoneCreditRoutes(router: Router, auditService: AuditService): Router {
  // todo: hard coded values, will come from service later
  const pinPhoneCredit = '35.13'
  const spendsBalance = '47.00'
  const pinPhoneCreditLimit = '50.00'
  const creditBuyCapacity = '14.87'

  router.get('/pin-phone/buy-credit', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CREDITS, { who: res.locals.user.username, correlationId: req.id })

    const { creditAmount, amountType } = req.session
    return res.render('pages/pin-phone/buy-pin-phone-credit', {
      pinPhoneCredit,
      spendsBalance,
      pinPhoneCreditLimit,
      creditBuyCapacity,
      creditAmount: creditAmount || '',
      amountType: amountType || '',
    })
  })
  router.post('/pin-phone/buy-credit', async (req, res) => {
    const { amount, customAmount } = req.body
    if (amount === 'other') {
      req.session.creditAmount = customAmount
      req.session.amountType = 'other'
    } else {
      req.session.creditAmount = amount
      req.session.amountType = amount
    }

    const error = validateBuyCreditInput(req.session.creditAmount, pinPhoneCredit, pinPhoneCreditLimit, spendsBalance)
    // Validation failed
    if (error.errorList.length > 0) {
      return res.render('pages/pin-phone/buy-pin-phone-credit', {
        pinPhoneCredit,
        spendsBalance,
        pinPhoneCreditLimit,
        creditBuyCapacity,
        creditAmount: '',
        amountType: req.session.amountType || '',
        ...error,
      })
    }
    return res.redirect('/pin-phone/check-order-details')
  })

  return router
}
