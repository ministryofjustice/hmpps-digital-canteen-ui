import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'
import { stringToPence, toPounds } from '../../utils/utils'
import PinPhoneService from '../../services/pinPhoneService'
import { PaymentRequest, PolicyEvaluation } from '../../pinPhone.model'
import errorMessages from '../../constants/errorMessages'

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

    return res.render('pages/pin-phone/check-order-details', {
      currentCreditBalance,
      newCreditBalance,
      totalCreditBalance,
    })
  })

  router.post(PATHS.CHECK_ORDER_DETAILS, async (req, res, _next) => {
    try {
      const { currentCreditPence } = req.session
      const requestedCreditPence = stringToPence(req.session.requestedCreditAmountPounds)
      const user = req.user as LaunchpadUser

      // Evaluate policy rules
      const prisonerEnrichment = await pinPhoneService.retrievePrisonerBalances(user.userId)
      const pinPhoneCreditLimitPence = prisonerEnrichment.prisonerBtBalance?.creditLimitPence ?? 0
      const opaData: PolicyEvaluation = {
        input: {
          productId: 'BT_PIN_Phone',
          currentBalance: currentCreditPence,
          creditLimit: pinPhoneCreditLimitPence,
        },
      }
      const policyResult = await pinPhoneService.evaluateRules(opaData)

      if (policyResult.result.decision === 'DENY') {
        const currentCreditBalance = toPounds(currentCreditPence)
        const newCreditBalance = toPounds(requestedCreditPence)
        const totalCreditBalance = toPounds(currentCreditPence + requestedCreditPence)
        return res.render('pages/pin-phone/check-order-details', {
          currentCreditBalance,
          newCreditBalance,
          totalCreditBalance,
          errorList: [{ text: errorMessages.POLICY_EVALUATION_ERROR, href: '#' }],
        })
      }

      const { cartId } = req.session
      const paymentRequest: PaymentRequest = {
        offenderNo: user.userId,
        amountPence: requestedCreditPence,
        prisonId: user.establishment.agency_id,
      }

      await pinPhoneService.completePayment(cartId, paymentRequest)

      return res.redirect(PATHS.PIN_PHONE_CONFIRMATION)
    } catch (error) {
      return _next(error)
    }
  })

  return router
}
