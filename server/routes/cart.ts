import { Router } from 'express'

import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/cart', async (req, res, _next) => {
    const { cartId } = req.session
    await services.medusaService.addPinPhoneCreditToCart(cartId, 5)

    return res.render('pages/cart')
  })

  return router
}
