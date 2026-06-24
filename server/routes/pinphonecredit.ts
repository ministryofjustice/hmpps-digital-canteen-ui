import { Router } from 'express'

import type { Services } from '../services'

const SPEND_BALANCE_DEFAULT = 30
const CURRENT_BALANCE_DEFAULT = 0.3

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const { amount = '' } = req.session
    const successMessage = req.session.successMessage
    const currentBalance = req.session.currentBalance ?? CURRENT_BALANCE_DEFAULT
    const spendBalance = req.session.spendBalance ?? SPEND_BALANCE_DEFAULT

    delete req.session.successMessage

    res.render('pages/pinphonecredit', {
      amount,
      successMessage,
      currentBalance,
      spendBalance,
      user: res.locals.user,
      csrfToken: req.csrfToken(),
      errors: [],
    })
  })

  router.post('/', async (req, res) => {
    let { amount } = req.body

    const currentBalance = req.session.currentBalance ?? CURRENT_BALANCE_DEFAULT
    const spendBalance = req.session.spendBalance ?? SPEND_BALANCE_DEFAULT

    if (amount === 'custom') {
      amount = req.body.amount_custom || ''
    }

    const errors = []

    if (!amount) {
      errors.push({
        text: 'Enter an amount',
        href: '#pin_amount',
      })
    } else if (Number.isNaN(Number(amount))) {
      errors.push({
        text: 'Enter a valid number',
        href: '#pin_amount',
      })
    } else if (Number(amount) > spendBalance) {
      errors.push({
        text: `Amount must be less than £${spendBalance}`,
        href: '#pin_amount',
      })
    }

    if (errors.length > 0) {
      return res.render('pages/pinphonecredit', {
        errors,
        amount,
        currentBalance,
        spendBalance,
        user: res.locals.user,
        csrfToken: req.csrfToken(),
      })
    }

    req.session.amount = amount
    req.session.newCredit = Number((currentBalance + Number(amount)).toFixed(2))
    req.session.newSpend = Number((spendBalance - Number(amount)).toFixed(2))
    req.session.currentBalance = currentBalance
    req.session.spendBalance = spendBalance

    if (!req.session.cartId) {
      const cart = await services.medusaService.createCart()
      req.session.cartId = cart.cart.id
    }

    return res.redirect('/checkout')
  })

  return router
}
