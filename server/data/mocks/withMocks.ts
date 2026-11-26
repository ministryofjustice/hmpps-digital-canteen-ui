import logger from '../../../logger'

interface MockSettings {
  // MOCK_API=true: every endpoint is mocked
  mockApi: boolean
  // false in preprod and prod, where the real API is always called
  mocksAllowed: boolean
}

type Mocks<Client> = { [Name in keyof Client]?: { realEndpointReady: boolean; mock: unknown } }

/**
 * Returns the client, with each endpoint's method replaced by its mock if:
 *  - MOCK_API=true, or
 *  - the real endpoint isn't ready yet (realEndpointReady: false)
 * Never in preprod or prod: there, the real client is returned unchanged
 */
export default function withMocks<Client extends object>(
  realClient: Client,
  mocks: Mocks<Client>,
  { mockApi, mocksAllowed }: MockSettings,
): Client {
  if (!mocksAllowed) return realClient

  const mocked = Object.entries(mocks)
    .map(([name, endpoint]) => ({ name, endpoint: endpoint as { realEndpointReady: boolean; mock: unknown } }))
    .filter(({ endpoint }) => mockApi || !endpoint.realEndpointReady)

  if (mocked.length) {
    logger.warn(`Using mock API responses for: ${mocked.map(({ name }) => name).join(', ')}`)
  }

  // Inherits the real client's methods, with the mocked ones replaced
  return Object.assign(
    Object.create(realClient),
    Object.fromEntries(mocked.map(({ name, endpoint }) => [name, endpoint.mock])),
  ) as Client
}
