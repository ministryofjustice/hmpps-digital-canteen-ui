import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.message = `<h2 class="govuk-heading-l">Sorry, there is a problem with the service.</h2>
      <p class="govuk-body">Try again later.</p>
      <p class="govuk-body">
        You are unable to add credit or view contacts online at this time.<br>
        Please use a kiosk instead.</p>`
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
