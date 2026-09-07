const environments: { [key: string]: string[] } = {
  PROD: [],
  PREPROD: [],
  TEST: ['BWI', 'CKI', 'RNI', 'EEI'],
  DEV: ['BWI', 'CKI', 'RNI', 'EEI', 'WLI'],
}

// eslint-disable-next-line import/prefer-default-export
export const ACTIVE_AGENCIES: readonly string[] = environments[process.env.ENVIRONMENT_NAME] || []
