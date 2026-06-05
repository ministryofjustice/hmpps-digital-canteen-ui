import { Router } from 'express'

import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/completecart', async (req, res, _next) => {
    const { cartId } = req.session
    await services.medusaService.completeCart(cartId)

    return res.render('pages/completecart')
  })

  return router
}
