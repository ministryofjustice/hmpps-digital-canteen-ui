import { Router } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'
import AuditService, { Page } from '../../services/auditService'
import { PATHS } from '../../constants/paths'
import validateBuyCreditInput from '../../utils/validateBuyCreditInput'
import { toPounds } from '../../utils/utils'

function getBalances() {
  const currentPinPhoneCreditPence = 3500.13
  const currentSpendsBalancePence = 4700.00
  const pinPhoneCreditLimitPence = 5000.00
  const creditBuyCapacityPence = 1400.87
  return {
    currentPinPhoneCreditPence,
    currentSpendsBalancePence,
    pinPhoneCreditLimitPence,
    creditBuyCapacityPence,
  }
}

function balancesForDisplay(balances: ReturnType<typeof getBalances>) {
  return {
    currentPinPhoneCredit: toPounds(balances.currentPinPhoneCreditPence),
    currentSpendsBalance: toPounds(balances.currentSpendsBalancePence),
    pinPhoneCreditLimit: toPounds(balances.pinPhoneCreditLimitPence),
    creditBuyCapacity: toPounds(balances.creditBuyCapacityPence),
  }
}

export default function buyPinPhoneCreditRoutes(
  router: Router,
  auditService: AuditService,
): Router {
  router.get(PATHS.BUY_CREDIT, async (req, res, _next) => {
    await auditService.logPageView(Page.PIN_PHONE_BUY_CREDITS, {
      who: res.locals.user.username,
      correlationId: req.id,
    })

    try {
      const { requestedCreditAmountPounds, amountType } = req.session

      // create cart
      const user = req.user as LaunchpadUser
      // const createCartRequest: CreateCartRequest = {
      //   metadata: {
      //     prison_id: user.establishment.agency_id,
      //     offender_no: user.userId,
      //     first_name: user.givenName,
      //     second_name: user.familyName,
      //   },
      // }
      // const result = await pinPhoneService.createCart(createCartRequest)
      // req.session.cartId = result.cart.id

      // get prisoner balances
      // const prisonerEnrichment = await pinPhoneService.retrievePrisonerBalances(user.userId)
      const balances = getBalances()

      return res.render('pages/pin-phone/buy-pin-phone-credit', {
        ...balancesForDisplay(balances),
        creditAmount: requestedCreditAmountPounds || '',
        amountType: amountType || '',
      })
    } catch (error) {
      return _next(error)
    }
  })

  router.post(PATHS.BUY_CREDIT, async (req, res, _next) => {
    try {
      const { amount, customAmount } = req.body
      if (amount === 'other') {
        req.session.requestedCreditAmountPounds = customAmount
        req.session.amountType = 'other'
      } else {
        req.session.requestedCreditAmountPounds = amount
        req.session.amountType = amount
      }

      const user = req.user as LaunchpadUser
      //const prisonerEnrichment = await pinPhoneService.retrievePrisonerBalances(user.userId)
      const balances = getBalances()
      req.session.currentCreditPence = balances.currentPinPhoneCreditPence

      const error = validateBuyCreditInput(
        req.session.requestedCreditAmountPounds,
        balances.currentPinPhoneCreditPence,
        balances.currentSpendsBalancePence,
        balances.pinPhoneCreditLimitPence,
      )

      if (error.errorList.length > 0) {
        return res.render('pages/pin-phone/buy-pin-phone-credit', {
          ...balancesForDisplay(balances),
          creditAmount: '',
          amountType: req.session.amountType || '',
          ...error,
        })
      }

      //const { cartId } = req.session
      //await pinPhoneService.addPinPhoneLineItem(cartId, stringToPence(req.session.requestedCreditAmountPounds))

      return res.redirect(PATHS.CHECK_ORDER_DETAILS)
    } catch (error) {
      return _next(error)
    }
    return res.redirect('/pin-phone/check-order-details')
  })

  return router
}
