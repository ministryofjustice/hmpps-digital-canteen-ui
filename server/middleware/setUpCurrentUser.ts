import { jwtDecode } from 'jwt-decode'
import { UUID } from 'crypto'
import express from 'express'
import { convertToTitleCase } from '../utils/utils'
import logger from '../../logger'
import { HmppsUser } from '../interfaces/hmppsUser'

export default function setUpCurrentUser() {
  const router = express.Router()

  router.use((req, res, next) => {
    if (req.portalType !== 'staff' || process.env.BYPASS_AUTH === 'true') return next()

    try {
      const {
        name,
        user_id: userId,
        user_uuid: userUuid,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        user_uuid?: UUID
        authorities?: string[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        userUuid,
        name,
        displayName: convertToTitleCase(name),
        userRoles: roles.map(role => role.substring(role.indexOf('_') + 1)),
      } as unknown as HmppsUser

      if (res.locals.user.authSource === 'nomis') {
        res.locals.user.staffId = userId !== undefined ? parseInt(userId, 10) : undefined
      }

      return next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user?.username}`)
      return next(error)
    }
  })

  return router
}
