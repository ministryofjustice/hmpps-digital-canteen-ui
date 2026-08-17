import { RequestHandler } from 'express'
import config from '../config'
import { PATHS } from '../constants/paths'

export default function setUpShuttering(): RequestHandler {
  return (req, res, next) => {
    if (config.shutterEnabled) {
      return res.status(503).render(PATHS.SHUTTER_PAGE)
    }
    return next()
  }
}
