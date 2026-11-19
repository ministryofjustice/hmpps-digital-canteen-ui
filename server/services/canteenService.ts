import { DigitalCanteenApiClient } from '../data'
import { CreateMedusaUserRequest } from '../canteen.model'

export default class CanteenService {
  constructor(private readonly digitalCanteenApiClient: DigitalCanteenApiClient) {}

  createMedusaUser(createMedusaUserRequest: CreateMedusaUserRequest) {
    return this.digitalCanteenApiClient.createMedusaUser(createMedusaUserRequest)
  }

  retrievePrisonerBalance(prisonerNumber: string) {
    return this.digitalCanteenApiClient.retrievePrisonerBalances(prisonerNumber)
  }
}
