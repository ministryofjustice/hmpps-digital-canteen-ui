import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function checkOrderDetailsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/check-order-details', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_CHECK_ORDER_DETAILS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    req.session.amountOfCredits = 10
    // to do: get these values from the backend
    const currentCreditBalance = 35.13
    const newCreditBalance = req.session.amountOfCredits
    const totalCreditBalance = currentCreditBalance + newCreditBalance
    return res.render('pages/pin-phone/check-order-details', {
      currentCreditBalance,
      newCreditBalance,
      totalCreditBalance,
    })
  })
  return router
}
