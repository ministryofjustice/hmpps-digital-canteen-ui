import { NextFunction, Request, Response } from 'express'
import setUpShuttering from './setUpShuttering'
import config from '../config'
import { PATHS } from '../constants/paths'

describe('setUpShuttering', () => {
  const req = {} as Request
  const next = jest.fn() as NextFunction

  const res = {
    status: jest.fn().mockReturnThis(),
    render: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shutter page when shuttering is enabled', () => {
    config.shutterEnabled = true

    const middleware = setUpShuttering()
    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.render).toHaveBeenCalledWith(PATHS.SHUTTER_PAGE)
    expect(next).not.toHaveBeenCalled()
  })

  it('next when shuttering is disabled', () => {
    config.shutterEnabled = false

    const middleware = setUpShuttering()
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(res.render).not.toHaveBeenCalled()
  })
})
