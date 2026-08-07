import { DigitalPinPhoneApiClient } from '../data'

export default class PinPhoneService {
  constructor(private readonly digitalPinPhoneApiClient: DigitalPinPhoneApiClient) {}

  retrieveContacts(prisonerNumber: string) {
    return this.digitalPinPhoneApiClient.retrieveContacts(prisonerNumber)
  }
}
