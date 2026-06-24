import passport from 'passport'
import flash from 'connect-flash'
import { Router } from 'express'
import { LaunchpadUser, PrisonerAuth, minutes } from '@ministryofjustice/hmpps-prisoner-auth'
import { HmppsUser } from '../interfaces/hmppsUser'
import config from '../config'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

const prisonerAuth = new PrisonerAuth({
  launchpadAuthUrl: config.apis.prisonerAuth.externalUrl,
  clientId: config.apis.prisonerAuth.apiClientId,
  clientSecret: config.apis.prisonerAuth.apiClientSecret,
  tokenMinimumLifespan: minutes(5),
  nonce: config.apis.prisonerAuth.nonce,
})

passport.use('prisoner-auth', prisonerAuth.passportStrategy())

export default function setUpPrisonerAuth() {
  const router = Router()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('prisoner-auth'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('prisoner-auth', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next),
  )

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect('/'))
      })
    } else res.redirect('/')
  })

  router.use(async (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl
      return res.redirect('/sign-in')
    }

    return prisonerAuth
      .validateAndRefreshUser(req.user as LaunchpadUser)
      .then(user => {
        req.user = user
        next()
      })
      .catch(() => res.redirect('/autherror'))
  })

  router.use((req, res, next) => {
    res.locals.user = req.user as HmppsUser
    next()
  })

  return router
}
