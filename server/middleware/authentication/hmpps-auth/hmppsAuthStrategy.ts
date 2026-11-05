import { Strategy } from 'passport-oauth2'
import { AuthenticatedRequest, VerificationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../../../config'
import logger from '../../../../logger'
import generateOauthClientToken from '../../../utils/clientCredentials'
import { AuthStrategy } from '../authStrategy'

export const hmppsAuthPassportStrategy = new Strategy(
  {
    authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
    tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
    clientID: config.apis.hmppsAuth.authClientId,
    clientSecret: config.apis.hmppsAuth.authClientSecret,
    callbackURL: '/sign-in/callback',
    state: true,
    customHeaders: { Authorization: generateOauthClientToken() },
  },
  (token, _refreshToken, params, _profile, done) =>
    done(null, { token, username: params.user_name, authSource: params.auth_source }),
)

const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)

const hmppsAuthStrategy: AuthStrategy = {
  name: 'hmpps-auth',

  signOutUrl: req => {
    const { externalUrl, authClientId } = config.apis.hmppsAuth
    return `${externalUrl}/sign-out?client_id=${authClientId}&redirect_uri=${req.protocol}://${req.host}`
  },

  checkAuthentication: async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest))) {
      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  },
}

export default hmppsAuthStrategy
