import withMocks from './withMocks'
import logger from '../../../logger'

jest.mock('../../../logger')

class RealClient {
  constructor(private readonly prefix: string) {}

  async ready(): Promise<string> {
    return `${this.prefix} ready`
  }

  async notReady(): Promise<string> {
    return `${this.prefix} not ready`
  }
}

const mocks = {
  ready: { realEndpointReady: true, mock: async () => 'mock ready' },
  notReady: { realEndpointReady: false, mock: async () => 'mock not ready' },
}

describe('withMocks', () => {
  const realClient = new RealClient('real')

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('by default, mocks only the endpoints whose real version is not ready', async () => {
    const client = withMocks(realClient, mocks, { mockApi: false, mocksAllowed: true })

    await expect(client.ready()).resolves.toBe('real ready')
    await expect(client.notReady()).resolves.toBe('mock not ready')
    expect(logger.warn).toHaveBeenCalledWith('Using mock API responses for: notReady')
  })

  it('with MOCK_API=true, mocks every endpoint', async () => {
    const client = withMocks(realClient, mocks, { mockApi: true, mocksAllowed: true })

    await expect(client.ready()).resolves.toBe('mock ready')
    await expect(client.notReady()).resolves.toBe('mock not ready')
  })

  it('in preprod and prod, never mocks: the real client is used unchanged', async () => {
    const client = withMocks(realClient, mocks, { mockApi: false, mocksAllowed: false })

    expect(client).toBe(realClient)
    await expect(client.notReady()).resolves.toBe('real not ready')
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('leaves the real client itself unchanged', async () => {
    withMocks(realClient, mocks, { mockApi: true, mocksAllowed: true })

    await expect(realClient.notReady()).resolves.toBe('real not ready')
  })

  it("doesn't log when nothing is mocked", () => {
    withMocks(realClient, { ready: mocks.ready }, { mockApi: false, mocksAllowed: true })

    expect(logger.warn).not.toHaveBeenCalled()
  })
})
