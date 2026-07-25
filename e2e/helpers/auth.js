import fs from 'node:fs'
import path from 'node:path'

import { expect } from '@playwright/test'

export const AUTH_DIR = path.resolve('e2e/.auth')
export const AUTH_STATE_PATH = path.join(AUTH_DIR, 'user.json')
export const AUTH_SKIP_MARKER = path.join(AUTH_DIR, 'skipped.txt')

export function getE2ECredentials() {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  return { email, password, hasAuthCredentials: Boolean(email && password) }
}

export function getAuthE2ESkipReason() {
  const { hasAuthCredentials } = getE2ECredentials()

  if (!hasAuthCredentials) {
    return 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for auth E2E'
  }

  if (fs.existsSync(AUTH_SKIP_MARKER)) {
    return fs.readFileSync(AUTH_SKIP_MARKER, 'utf8').trim()
  }

  return null
}

export async function loginAsTestUser(page, credentials = getE2ECredentials()) {
  const { email, password } = credentials

  await page.goto('/login')
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)

  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/v1/token') && response.request().method() === 'POST',
    { timeout: 30_000 }
  )

  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  const response = await loginResponse

  if (!response.ok()) {
    const body = await response.text().catch(() => '')
    throw new Error(`Supabase login failed (${response.status()}): ${body.slice(0, 240)}`)
  }

  await expect(page).not.toHaveURL(/\/login(?:\?|$)/, { timeout: 20_000 })
}

export async function waitForActivityPage(page, slug, headingPattern) {
  await page.goto(`/actividad/${slug}`)
  await expect(page.locator('#act-view')).toBeVisible()
  await expect(page.getByText(/cargando actividad/i)).toHaveCount(0, { timeout: 20_000 })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(headingPattern, {
    timeout: 20_000,
  })
}
