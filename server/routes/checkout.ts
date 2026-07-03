import { Router } from 'express'

import type { Services } from '../services'
import session from "express-session";

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/checkout', async (req, res, _next) => {
    const amount = Number(req.session.amount || 0)
    console.log('****** Amount ****** : ', amount)

    const currentBalance = req.session.currentBalance ?? 0.3
    const spendBalance = req.session.spendBalance ?? 30
    const creditPurchaseAmount = Number(amount).toFixed(2)
    const spendsAfterPurchase = (spendBalance - amount).toFixed(2)
    const newSpends = req.session.newSpend || 30
    const newCredit = req.session.newCredit || 0.30
    console.log('****** NEW SPENDS ****** : ', Number(0.30), newCredit)

    const yourMoneySummary = {
      rows: [
        {
          key: { text: 'Current Spends' },
          value: { text: `£${spendBalance}` },
        },
        {
          key: { text: 'PIN phone credit selected' },
          value: { text: `£${creditPurchaseAmount}` },
        },
        {
          key: { text: 'Spends after purchase' },
          value: { text: `£${spendsAfterPurchase}` },
        },
      ],
    }

    res.render('pages/pin_phone_checkout', {
      yourMoneySummary,
      amount,
      csrfToken: req.csrfToken(),
      newSpends,
      newCredit,
      currentBalance,
      errors: [],
    })
  })

  router.post('/checkout', async (req, res, _next) => {
    const { agree } = req.body
    if (agree !== 'yes') {
      const amount = Number(req.session.amount)
      const currentBalance = req.session.currentBalance ?? 0.3
      const spendBalance = req.session.spendBalance ?? 30
      const creditPurchaseAmount = Number(amount).toFixed(2)
      const spendsAfterPurchase = (spendBalance - amount).toFixed(2)
      const newSpends = req.session.newSpend || 30
      const newCredit = req.session.newCredit || 0.30

      const yourMoneySummary = {
        rows: [
          {
            key: { text: 'Current Spends' },
            value: { text: `£${spendBalance}` },
          },
          {
            key: { text: 'PIN phone credit selected' },
            value: { text: `£${creditPurchaseAmount}` },
          },
          {
            key: { text: 'Spends after purchase' },
            value: { text: `£${spendsAfterPurchase}` },
          },
        ],
      }

      return res.render('pages/pin_phone_checkout', {
        yourMoneySummary,
        amount,
        csrfToken: req.csrfToken(),
        newSpends,
        newCredit,
        currentBalance,
        errors: [{ text: 'You must agree to the purchase to proceed', href: '#agree' }],
        agree,
      })
    }

    const cartId = req.session.cartId
    console.log('****** CART UPDATED ******: ', cartId)
    //add the pin phone credit to the cart
    await services.medusaService.addPinPhoneCreditToCart(cartId, req.session.amount)
    //complete the cart
    await services.medusaService.completeCart(cartId)
    req.session.successMessage = `You have successfully bought £${Number(req.session.amount).toFixed(2)} of phone credit.
              <br> <p>Check the <a href="/buyingHistory">buying history</a> tab if you think there is a problem.</p>`
    req.session.currentBalance = req.session.newCredit
    req.session.spendBalance = req.session.newSpend

    //clear the session data
    delete req.session.cartId
    delete req.session.amount
    delete req.session.newCredit
    delete req.session.newSpend

    res.redirect('/')
  })
  return router
}
