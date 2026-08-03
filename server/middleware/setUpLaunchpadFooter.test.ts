import type { NextFunction, Request, Response } from 'express'
import { setUpLaunchpadFooter } from './setUpLaunchpadFooter'

describe('setUpLaunchpadFooter', () => {
  it('sets launchpadFooterConfig and calls next', () => {
    const next = jest.fn() as NextFunction
    const req = {} as Request
    const res = {
      locals: {},
    } as Response

    setUpLaunchpadFooter(req, res, next)

    expect(res.locals.launchpadFooterConfig).toEqual({
      meta: {
        hiddenDescription: 'Links',
        items: [{ href: '/external/privacy-policy', label: 'Privacy Policy', attributes: { target: '_blank' } }],
      },
    })
    expect(next).toHaveBeenCalledTimes(1)
  })
})
