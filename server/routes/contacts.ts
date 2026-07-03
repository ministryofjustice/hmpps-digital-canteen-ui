import { Router } from 'express'

import type { Services } from '../services'

export default function routes(services: Services): Router {
  const router = Router()

  router.get('/contacts', async (req, res, _next) => {
    return res.render('pages/contacts')
  })
  return router
}
