import fs from 'node:fs'

import { test as setup } from '@playwright/test'

import {
  AUTH_DIR,
  AUTH_SKIP_MARKER,
  AUTH_STATE_PATH,
  getE2ECredentials,
  loginAsTestUser,
} from './helpers/auth.js'

setup('prepare authenticated storage state', async ({ page }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true })

  const { hasAuthCredentials } = getE2ECredentials()

  if (!hasAuthCredentials) {
    fs.writeFileSync(
      AUTH_SKIP_MARKER,
      'Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD in CI secrets.'
    )
    fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  try {
    await loginAsTestUser(page)
    await page.context().storageState({ path: AUTH_STATE_PATH })

    if (fs.existsSync(AUTH_SKIP_MARKER)) {
      fs.unlinkSync(AUTH_SKIP_MARKER)
    }
  } catch (error) {
    fs.writeFileSync(
      AUTH_SKIP_MARKER,
      `E2E login failed: ${error.message}. ` +
        'Verify GitHub secrets and that the test user email is confirmed in Supabase.'
    )
    fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }))
  }
})
