import { RequestHandler } from 'express'
import { LaunchpadUser } from '@ministryofjustice/hmpps-prisoner-auth'

// eslint-disable-next-line import/prefer-default-export
export const setUpLaunchpadHeader: RequestHandler = (req, res, next) => {
  const user = req.user as LaunchpadUser
  // eslint-disable-next-line no-console
  console.log('Request:', req)
  // eslint-disable-next-line no-console
  console.log('Launchpad Header Config: ', user)

  const hrefOf = (lang: string) => `?lang=${lang}`

  res.locals.launchpadHeaderConfig = {
    url: process.env.LAUNCHPAD_URL,
    user: { name: user?.name },
    translations: {
      enabled: false,
      currentLanguageCode: 'en',
      options: [
        { href: hrefOf('en'), code: 'en', label: 'English' },
        { href: hrefOf('cy'), code: 'cy', label: 'Cymraeg' },
      ],
    },
  }

  next()
}
