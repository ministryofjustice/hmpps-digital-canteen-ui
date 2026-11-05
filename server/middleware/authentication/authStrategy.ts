import { Request, RequestHandler } from 'express'

export type AuthStrategyKind = 'prisoner-auth' | 'hmpps-auth'

export type AuthStrategy = {
  name: AuthStrategyKind
  signOutUrl: (req: Request) => string
  checkAuthentication: RequestHandler
}
