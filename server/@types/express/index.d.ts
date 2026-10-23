import { HmppsUser } from '../../interfaces/hmppsUser'

export declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    requestedCreditAmountPounds: string
    amountType: string
    currentCreditPence: number
    cartId: string
    allContacts: PrisonerContact[]
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      logout(done: (err: unknown) => void): void
      portalType?: PortalType
      authStrategy?: AuthStrategy
    }

    interface Locals {
      user: HmppsUser
      isStaffPortal: boolean
      isPrisonerPortal: boolean
      cspNonce: string
      csrfToken: string
      asset_path: string
      applicationName: string
      environmentName: string
      environmentNameColour: string
      appInsightsConnectionString?: string
      appInsightsApplicationName?: string
      buildNumber?: string
    }
  }
}
