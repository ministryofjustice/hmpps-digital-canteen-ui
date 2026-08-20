import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'
import { stringToPence, toPounds } from '../../utils/utils'

export default function checkOrderDetailsRoutes(router: Router, auditService: AuditService): Router {
  router.get(PATHS.CHECK_ORDER_DETAILS, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_CHECK_ORDER_DETAILS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    const { currentCreditPence } = req.session
    const requestedCreditPence = stringToPence(req.session.requestedCreditAmountPounds)

    const currentCreditBalance = toPounds(currentCreditPence)
    const newCreditBalance = toPounds(requestedCreditPence)
    const totalCreditBalance = toPounds(currentCreditPence + requestedCreditPence)

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
