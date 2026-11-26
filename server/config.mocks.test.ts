import fs from 'node:fs'
import path from 'node:path'
import { mockSettings } from './config'

// Mock API responses must only be used in dev, test and local development
describe('config: mock API responses', () => {
  it.each([
    ['dev', { ENVIRONMENT_NAME: 'DEV', NODE_ENV: 'production' }],
    ['test', { ENVIRONMENT_NAME: 'TEST', NODE_ENV: 'production' }],
    ['local development', { NODE_ENV: 'development' }],
    ['unit tests', { NODE_ENV: 'test' }],
  ])('allows mocks in %s', (_where, env) => {
    expect(mockSettings({ ...env, MOCK_API: 'true' })).toEqual({ mockApi: true, mocksAllowed: true })
  })

  it.each([
    ['PREPROD', { ENVIRONMENT_NAME: 'PREPROD', NODE_ENV: 'production' }],
    ['PROD', { ENVIRONMENT_NAME: 'PROD', NODE_ENV: 'production' }],
    ['prod, in lower case', { ENVIRONMENT_NAME: 'prod', NODE_ENV: 'production' }],
    ['an unknown environment', { ENVIRONMENT_NAME: 'STAGING', NODE_ENV: 'production' }],
    ['a deployment without ENVIRONMENT_NAME', { NODE_ENV: 'production' }],
  ])('never uses mocks in %s', (_where, env) => {
    expect(mockSettings(env)).toEqual({ mockApi: false, mocksAllowed: false })
  })

  it.each([
    ['PREPROD', { ENVIRONMENT_NAME: 'PREPROD', NODE_ENV: 'production' }, 'PREPROD'],
    ['PROD', { ENVIRONMENT_NAME: 'PROD', NODE_ENV: 'production' }, 'PROD'],
    ['a deployment without ENVIRONMENT_NAME', { NODE_ENV: 'production' }, 'this environment'],
  ])('refuses to start with MOCK_API=true in %s', (_where, env, name) => {
    expect(() => mockSettings({ ...env, MOCK_API: 'true' })).toThrow(`MOCK_API=true isn't allowed in ${name}`)
  })

  it('defaults to MOCK_API=false', () => {
    expect(mockSettings({ ENVIRONMENT_NAME: 'DEV' }).mockApi).toBe(false)
  })

  it.each(['values-preprod.yaml', 'values-prod.yaml'])("%s doesn't set MOCK_API", valuesFile => {
    const values = fs.readFileSync(path.resolve(__dirname, '../helm_deploy', valuesFile), 'utf8')
    expect(values).not.toMatch(/MOCK_API/)
  })

  it.each([
    ['values-dev.yaml', 'DEV'],
    ['values-test.yaml', 'TEST'],
    ['values-preprod.yaml', 'PREPROD'],
    ['values-prod.yaml', 'PROD'],
  ])('%s sets ENVIRONMENT_NAME to %s', (valuesFile, environmentName) => {
    const values = fs.readFileSync(path.resolve(__dirname, '../helm_deploy', valuesFile), 'utf8')
    expect(values).toMatch(new RegExp(`ENVIRONMENT_NAME: "?${environmentName}"?\\s*$`, 'm'))
  })
})
