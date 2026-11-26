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
import withMocks from './mocks/withMocks'
import digitalCanteenApiMocks from './mocks/digitalCanteenApiMocks'

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
    // Mock responses for endpoints the real API doesn't have yet, or for every endpoint with MOCK_API=true
    digitalCanteenApiClient: withMocks(
      new DigitalCanteenApiClient(hmppsAuthClient),
      digitalCanteenApiMocks,
      config.mocks,
    ),
    hmppsAuditClient: new HmppsAuditClient(config.sqs.audit),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>

export { AuthenticationClient, HmppsAuditClient, DigitalCanteenApiClient }
