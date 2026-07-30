import type { NextFunction, Request, Response } from 'express'
import { setUpLaunchpadHeader } from './setUpLaunchpadHeader'

describe('setUpLaunchpadHeader', () => {
  it('sets launchpadHeaderConfig from authenticated user', () => {
    const next = jest.fn() as NextFunction
    const req = {
      user: {
        name: 'A Test User',
      },
    } as unknown as Request
    const res = {
      locals: {},
    } as Response

    setUpLaunchpadHeader(req, res, next)

    expect(res.locals.launchpadHeaderConfig).toEqual({
      user: { name: 'A Test User' },
      translations: {
        enabled: false,
        currentLanguageCode: 'en',
        options: [
          { href: '?lang=en', code: 'en', label: 'English' },
          { href: '?lang=cy', code: 'cy', label: 'Cymraeg' },
        ],
      },
    })
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('still sets config and calls next when user is missing', () => {
    const next = jest.fn() as NextFunction
    const req = {} as Request
    const res = {
      locals: {},
    } as Response

    setUpLaunchpadHeader(req, res, next)

    expect(res.locals.launchpadHeaderConfig).toEqual({
      user: { name: undefined },
      translations: {
        enabled: false,
        currentLanguageCode: 'en',
        options: [
          { href: '?lang=en', code: 'en', label: 'English' },
          { href: '?lang=cy', code: 'cy', label: 'Cymraeg' },
        ],
      },
    })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
