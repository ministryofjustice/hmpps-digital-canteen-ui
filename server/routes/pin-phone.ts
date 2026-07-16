import { Router } from 'express'
import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/pin-phone', async (req, res, _next) => {
    const userName = 'John'
    return res.render('pages/pin-phone', {
      userName,
      buyCreditsUrl: '/pin-phone/buy-credit',
      viewContactsUrl: '/pin-phone/contacts',
    })
  })

  return router
}
