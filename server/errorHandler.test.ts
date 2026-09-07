import type { Express } from 'express'
import request from 'supertest'
import { appWithAllRoutes } from './routes/testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('ErrorHandler', () => {
  it('should render 404 content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not Found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render 404 content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service.')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })

  it('should render 500 content with stack in dev mode', () => {
    return request(app)
      .get('/error')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('InternalServerError: Test Error')
      })
  })

  it('should render 500 content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/error')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service.')
        expect(res.text).not.toContain('InternalServerError: Test Error')
      })
  })
})
