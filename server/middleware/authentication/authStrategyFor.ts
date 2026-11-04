import { Request } from 'express'
import { AuthStrategy } from './authStrategy'
import prisonerAuthStrategy from './prisoner-auth/prisonerAuthStrategy'
import hmppsAuthStrategy from './hmpps-auth/hmppsAuthStrategy'

const authStrategyFor = (req: Request): AuthStrategy =>
  req.portalType === 'staff' ? hmppsAuthStrategy : prisonerAuthStrategy

export default authStrategyFor
