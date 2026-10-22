import passport from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import config from '../config'
import { HmppsUser } from '../interfaces/hmppsUser'
import authStrategyFor from './authentication/authStrategyFor'
import bypassAuth from './authentication/bypassAuth'
import { prisonerAuth } from './authentication/prisoner-auth/prisonerAuthStrategy'
import { hmppsAuthPassportStrategy } from './authentication/hmpps-auth/hmppsAuthStrategy'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

passport.use('prisoner-auth', prisonerAuth.passportStrategy())
passport.use('hmpps-auth', hmppsAuthPassportStrategy)

export default function setUpAuthentication() {
  // Bypass login authentication on Local (add BYPASS_AUTH=true to .env)
  if (process.env.BYPASS_AUTH === 'true' && !config.production) {
    return bypassAuth()
  }

  const router = Router()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.use((req, _res, next) => {
    req.authStrategy = authStrategyFor(req)
    next()
  })

  router.get('/autherror', (_req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', (req, res, next) => passport.authenticate(req.authStrategy.name)(req, res, next))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate(req.authStrategy.name, {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  router.use('/sign-out', (req, res, next) => {
    const signOutUrl = req.authStrategy.signOutUrl(req)
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(signOutUrl))
      })
    } else res.redirect(signOutUrl)
  })

  router.use('/account-details', (req, res, next) => {
    if (req.portalType !== 'staff') return next()
    const { externalUrl, authClientId } = config.apis.hmppsAuth
    return res.redirect(
      `${externalUrl}/account-details?client_id=${authClientId}&redirect_uri=${req.protocol}://${req.host}`,
    )
  })

  router.use((req, res, next) => req.authStrategy.checkAuthentication(req, res, next))

  router.use((req, res, next) => {
    res.locals.user = req.user as HmppsUser
    next()
  })

  return router
}
