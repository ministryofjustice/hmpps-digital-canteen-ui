/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'

import applicationInfoSupplier from '../applicationInfo'

import { createRedisClient } from './redisClient'
import config from '../config'
import HmppsAuditClient from './hmppsAuditClient'
import logger from '../../logger'
import DigitalCanteenApiClient from './digitalCanteenApiClient'

const applicationInfo = applicationInfoSupplier()
export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    hmppsAuthClient,
    digitalCanteenApiClient: new DigitalCanteenApiClient(hmppsAuthClient),
    hmppsAuditClients: {
      staff: new HmppsAuditClient(config.sqs.audit.staff),
      prisoner: new HmppsAuditClient(config.sqs.audit.prisoner),
    },
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, DigitalCanteenApiClient }
