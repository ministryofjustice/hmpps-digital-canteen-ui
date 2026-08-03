import config from '../config'

export default function generateOauthClientToken(
  clientId: string = config.apis.prisonerAuth.apiClientId,
  clientSecret: string = config.apis.prisonerAuth.apiClientSecret,
): string {
  const token = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  return `Basic ${token}`
}
