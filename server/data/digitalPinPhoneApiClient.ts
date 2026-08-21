import { RestClient, asSystem } from '@ministryofjustice/hmpps-rest-client'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import config from '../config'
import logger from '../../logger'
import { CreateCartRequest, EnrichedPinPhonePrisoner, PrisonerContact } from '../pinPhone.model'
import { PATHS } from '../constants/paths'

export default class DigitalPinPhoneApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Digital PinPhone API', config.apis.digitalCanteenApi, logger, authenticationClient)
  }

  async createCart({ prisonId, offenderNo, firstName, lastName }: CreateCartRequest): Promise<{ cartId: string }> {
    return this.post(
      {
        path: PATHS.CREATE_CART,
        data: { prisonId, offenderNo, firstName, lastName },
      },
      asSystem(),
    )
  }

  async retrieveContacts(prisonerNumber: string): Promise<PrisonerContact[]> {
    return this.get(
      {
        path: `/api/prisoner-contacts/${prisonerNumber}`,
      },
      asSystem(),
    )
  }

  async retrievePrisonerBalances(prisonerNumber: string): Promise<EnrichedPinPhonePrisoner> {
    return this.get(
      {
        path: `/api/prisoner-enrichment/${prisonerNumber}`,
      },
      asSystem(),
    )
  }

  async addPinPhoneLineItem(cartId: string, creditAmount: number): Promise<EnrichedPinPhonePrisoner> {
    return this.post(
      {
        path: `/api/add-line-item`,
        data: { amount: creditAmount, cartId },
      },
      asSystem(),
    )
  }
}
