import { RequestHandler } from 'express'

// eslint-disable-next-line import/prefer-default-export
export const setUpLaunchpadFooter: RequestHandler = (req, res, next) => {
  if (res.locals.isStaffPortal) return next()
  res.locals.launchpadFooterConfig = {
    meta: {
      hiddenDescription: 'Links',
      items: [{ href: '/external/privacy-policy', label: 'Privacy Policy', attributes: { target: '_blank' } }],
    },
  }

  return next()
}
