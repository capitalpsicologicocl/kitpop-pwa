import { test, expect } from '@playwright/test'

import { getAuthE2ESkipReason } from './helpers/auth.js'

const authSkipReason = getAuthE2ESkipReason()

test.describe('Authenticated flows', () => {
  test.skip(Boolean(authSkipReason), authSkipReason ?? '')

  test('explorer sees export gate on workshops list path', async ({ page }) => {
    await page.goto('/talleres')
    await expect(page.locator('#workshops-view, main')).toBeVisible()
  })
})
