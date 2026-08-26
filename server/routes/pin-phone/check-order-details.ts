import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'
import { stringToPence, toPounds } from '../../utils/utils'
import PinPhoneService from '../../services/pinPhoneService'
import { PaymentRequest } from '../../pinPhone.model'

export default function checkOrderDetailsRoutes(
  router: Router,
  auditService: AuditService,
  pinPhoneService: PinPhoneService,
): Router {
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
    console.log('FIRST HERRREEEEE')
    console.log(requestedCreditPence)

    return res.render('pages/pin-phone/check-order-details', {
      currentCreditBalance,
      newCreditBalance,
      totalCreditBalance,
    })
  })

  router.post(PATHS.PIN_PHONE_CONFIRMATION, async (req, res, _next) => {
    try {
      console.log('THEN HERRREEEEE', req.session)
      const requestedCreditPence = stringToPence(req.session.requestedCreditAmountPounds)
      const user = req.user as LaunchpadUser
      console.log(user)
      const { cartId } = req.session
      const paymentRequest: PaymentRequest = {
        offender_no: user.userId,
        amountPence: requestedCreditPence,
      }
      console.log('paymentrequest', paymentRequest)

      await pinPhoneService.completePayment(cartId, paymentRequest)

      return res.redirect(PATHS.PIN_PHONE_CONFIRMATION)
    } catch (error) {
      return _next(error)
    }
  })

  return router
}
