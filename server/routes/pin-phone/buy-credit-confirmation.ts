import { Router } from 'express'
import AuditService from '../../services/auditService'

export default function buyCreditConfirmation(router: Router, auditService: AuditService): Router {
  router.get('/pin-phone/buy-credit-confirmation', async (req, res, _next) => {
    const dateBought = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    console.log(dateBought)
    return res.render('pages/pin-phone/buy-credit-confirmation', { dateBought })
  })

  return router
}
