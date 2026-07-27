import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'

export default function checkOrderDetailsRoutes(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/check-order-details', async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_CHECK_ORDER_DETAILS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const currentCreditBalance = 35.13
    const newCreditBalance = Number(req.session.creditAmount || 0).toFixed(2)
    const totalCreditBalance = (currentCreditBalance + Number(req.session.creditAmount || 0)).toFixed(2)
    return res.render('pages/pin-phone/check-order-details', {
      currentCreditBalance,
      newCreditBalance,
      totalCreditBalance,
    })
  })
  return router
}
