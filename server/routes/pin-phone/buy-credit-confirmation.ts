import { Router } from 'express'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'

export default function buyCreditConfirmation(router: Router, auditService: AuditService): Router {
  router.get(PATHS.PIN_PHONE_CONFIRMATION, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CONFIRMATION, {
      who: res.locals.user.username,
      correlationId: req.id,
    })
    // reset buy credit session data
    delete req.session.requestedCreditAmountPounds
    delete req.session.amountType

    const dateBought = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return res.render('pages/pin-phone/buy-credit-confirmation', { dateBought })
  })

  return router
}
