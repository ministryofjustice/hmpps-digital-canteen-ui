import type { NextFunction, Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import errorMessages from './constants/errorMessages'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    type ErrorWithData = {
      data?: {
        status?: number
        userMessage?: string
      }
    }

    const { data } = error as ErrorWithData

    const isMedusaUnavailable = data?.status === 400 && data?.userMessage === errorMessages.MEDUSA_UNAVAILABLE_MESSAGE

    res.locals.message = `<h2 class="govuk-heading-l">Sorry, there is a problem with the service.</h2>
      <p class="govuk-body">Try again later.</p>
      <p class="govuk-body">
        You are unable to add credit ${isMedusaUnavailable ? '' : 'or view contacts online '}at this time.<br>
        Please use a kiosk instead.</p>

       <p class="govuk-body"> ${isMedusaUnavailable ? 'You can still use this service to <a href="/pin-phone/view-contacts" class="govuk-link">view contacts.</a>' : ''}</p>`
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
