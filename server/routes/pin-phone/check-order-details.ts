import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'

export default function checkOrderDetailsRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.CHECK_ORDER_DETAILS, async (req, res, _next) => {
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

  router.post(PATHS.CHECK_ORDER_DETAILS, async (req, res) => {
    return res.redirect(PATHS.PIN_PHONE_CONFIRMATION)
  })
  return router
}
