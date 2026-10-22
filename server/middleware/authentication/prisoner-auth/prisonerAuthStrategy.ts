import { LaunchpadUser, PrisonerAuth, minutes } from '@ministryofjustice/hmpps-prisoner-auth'
import config from '../../../config'
import { AuthStrategy } from '../authStrategy'

// Unchanged from the previous inline setup in setUpAuthentication.ts
export const prisonerAuth = new PrisonerAuth({
  launchpadAuthUrl: config.apis.prisonerAuth.externalUrl,
  clientId: config.apis.prisonerAuth.apiClientId,
  clientSecret: config.apis.prisonerAuth.apiClientSecret,
  tokenMinimumLifespan: minutes(config.apis.prisonerAuth.refreshCheckTimeInMinutes),
  nonce: config.apis.prisonerAuth.nonce,
  scope: ['user.basic.read', 'user.establishment.read'],
})

const prisonerAuthStrategy: AuthStrategy = {
  name: 'prisoner-auth',

  signOutUrl: () => '/',

  checkAuthentication: async (req, res, next) => {
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
      .catch(() => res.redirect('/sign-out'))
  },
}

export default prisonerAuthStrategy
