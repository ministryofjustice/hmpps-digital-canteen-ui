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

  it('should render Medusa service unavailable message', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/medusa-error')
      .expect(400)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('You are unable to add credit right now.')
        expect(res.text).toContain('Please use a kiosk instead.')
        expect(res.text).toContain(
          '<p class="govuk-body">You can still use this service to <a href="/pin-phone/view-contacts" class="govuk-link">view contacts</a>.</p>',
        )
        expect(res.text).not.toContain('You are unable to add credit or view contacts online at this time.')
      })
  })
})
