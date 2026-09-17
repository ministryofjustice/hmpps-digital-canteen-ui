import type { Request, Response } from 'express'
import checkActiveAgencyAccess from './checkActiveAgencyAccess'
import ERROR_MESSAGE from '../constants/errorMessages'

let mockActiveAgencies: readonly string[] = []

jest.mock('../constants/activeAgencies', () => ({
  get ACTIVE_AGENCIES() {
    return mockActiveAgencies
  },
}))

describe('checkActiveAgencyAccess', () => {
  const req: Request = {} as jest.Mocked<Request>
  const next = jest.fn()

  function createRes(prisonId: string, hasUser: boolean): Response {
    return {
      locals: {
        ...(hasUser
          ? {
              user: {
                username: 'USER1',
                establishment: { agency_id: prisonId },
              },
            }
          : {}),
      },
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    } as unknown as Response
  }

  const ENTRY_DENIED_ERROR_PAGE = {
    message: ERROR_MESSAGE.ENTRY_DENIED_ERROR_MESSAGE,
    accessDenied: true,
  }

  beforeEach(() => {
    jest.resetAllMocks()
    mockActiveAgencies = ['BWI', 'CKI', 'RNI', 'EEI']
  })

  it('allows access when prisoner caseload/prisonId matches active agencies', async () => {
    const res = createRes('CKI', true)

    const middleware = checkActiveAgencyAccess()
    await middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })

  it('denies access when when prisoner caseload/prisonId is not in active agencies', async () => {
    const res = createRes('LEI', true)

    await checkActiveAgencyAccess()(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('pages/error', ENTRY_DENIED_ERROR_PAGE)
  })

  it('denies access when user is missing', async () => {
    const res = createRes(undefined, false)

    const middleware = checkActiveAgencyAccess()
    await middleware(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.render).toHaveBeenCalledWith('pages/error', ENTRY_DENIED_ERROR_PAGE)
  })
})
