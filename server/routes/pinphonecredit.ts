import { Router } from 'express'

import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/', async (req, res, _next) => {
    const cart = await services.medusaService.createCart()

    console.log('cart', cart.cart.id)
    req.session.cartId = cart.cart.id

    return res.render('pages/pinphonecredit')
  })

  return router
}
