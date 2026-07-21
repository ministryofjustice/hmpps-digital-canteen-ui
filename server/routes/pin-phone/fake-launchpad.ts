import { Router } from 'express'

export default function launchpadRoutes(router: Router): Router {
  router.get('/launchpad', async (req, res, _next) => {
    return res.render('pages/pin-phone/fake-launchpad', {
      pinPhoneUrl: '/pin-phone',
    })
  })

  return router
}
