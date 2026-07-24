import { expect } from '@playwright/test'

export function getE2ECredentials() {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  return { email, password, hasAuthCredentials: Boolean(email && password) }
}

export async function loginAsTestUser(page, credentials = getE2ECredentials()) {
  const { email, password } = credentials

  await page.goto('/login')
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()

  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })
  await expect(page.locator('.auth-message.error')).toHaveCount(0)
}

export async function waitForActivityPage(page, slug, headingPattern) {
  await page.goto(`/actividad/${slug}`)
  await expect(page.locator('#act-view')).toBeVisible()
  await expect(page.getByText(/cargando actividad/i)).toHaveCount(0, { timeout: 20_000 })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(headingPattern, {
    timeout: 20_000,
  })
}
