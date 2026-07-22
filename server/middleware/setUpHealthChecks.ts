import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'
import { ACTIVE_AGENCIES } from '../constants/activeAgencies'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/health', middleware.health)
  router.get(
    '/info',
    (_req, _res, next) => {
      // eslint-disable-next-line no-param-reassign
      applicationInfo.additionalFields = { activeAgencies: [...ACTIVE_AGENCIES] }
      next()
    },
    middleware.info,
  )
  router.get('/ping', middleware.ping)

  return router
}
