import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import PinPhoneService from '../../services/pinPhoneService'
import { CreateCartRequest } from '../../pinPhone.model'
import { PATHS } from '../../constants/paths'
import validateBuyCreditInput from '../../utils/validateBuyCreditInput'

export default function buyPinPhoneCreditRoutes(
  router: Router,
  auditService: AuditService,
  pinPhoneService: PinPhoneService,
): Router {
  // todo: hard coded values, will come from service later
  const pinPhoneCredit = '35.13'
  const spendsBalance = '47.00'
  const pinPhoneCreditLimit = '50.00'
  const creditBuyCapacity = '14.87'

  router.get(PATHS.BUY_CREDIT, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CREDITS, { who: res.locals.user.username, correlationId: req.id })

    try {
      const { creditAmount, amountType } = req.session

      // create cart
      const user = req.user as LaunchpadUser
      const createCartRequest: CreateCartRequest = {
        prisonId: user.establishment.agency_id,
        offenderNo: user.userId,
        firstName: user.givenName,
        lastName: user.familyName,
      }
      const result = await pinPhoneService.createCart(createCartRequest)
      req.session.cartId = result.cartId

      return res.render('pages/pin-phone/buy-pin-phone-credit', {
        pinPhoneCredit,
        spendsBalance,
        pinPhoneCreditLimit,
        creditBuyCapacity,
        creditAmount: creditAmount || '',
        amountType: amountType || '',
      })
    } catch (error) {
      return _next(error)
    }
  })
  router.post(PATHS.BUY_CREDIT, async (req, res) => {
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
    return res.redirect(PATHS.CHECK_ORDER_DETAILS)
  })
  return router
}
