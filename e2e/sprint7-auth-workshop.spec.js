import { test, expect } from '@playwright/test'

const email = process.env.E2E_TEST_EMAIL
const password = process.env.E2E_TEST_PASSWORD
const hasAuthCredentials = Boolean(email && password)

async function loginAsTestUser(page) {
  await page.goto('/login')
  await page.getByLabel(/correo/i).fill(email)
  await page.getByLabel(/contraseña/i).fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 })
}

test.describe('Sprint 7 — Auth workshop export gate', () => {
  test.skip(!hasAuthCredentials, 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for auth E2E')

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('login → talleres → resumen muestra gate Pro o exports', async ({ page }) => {
    await page.goto('/talleres')
    await expect(page.locator('#workshops-view')).toBeVisible()

    const editLink = page.getByRole('link', { name: 'Editar diseño' }).first()

    if (await editLink.count()) {
      await editLink.click()
    } else {
      const title = `E2E Taller ${Date.now()}`
      await page.getByLabel(/nombre del taller/i).fill(title)
      await page.getByRole('button', { name: /crear taller/i }).click()
    }

    await expect(page).toHaveURL(/\/talleres\/[0-9a-f-]+/, { timeout: 20_000 })

    const workshopId = page.url().match(/\/talleres\/([0-9a-f-]+)/)?.[1]
    expect(workshopId).toBeTruthy()

    await page.goto(`/talleres/${workshopId}/resumen`)
    await expect(page.locator('#workshops-view')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const proGate = page.locator('.export-pro-gate')
    const exportActions = page.locator('.export-actions')

    await expect(proGate.or(exportActions)).toBeVisible({ timeout: 15_000 })

    if (await proGate.isVisible()) {
      await expect(proGate.getByRole('heading', { name: /KitPOP Pro/i })).toBeVisible()
      await expect(proGate.getByRole('link', { name: /Ver planes Pro/i })).toBeVisible()
    } else {
      await expect(exportActions.getByRole('button', { name: /Descargar Word/i })).toBeVisible()
      await expect(exportActions.getByRole('button', { name: /Descargar PDF/i })).toBeVisible()
    }
  })

  test('actividad PERMA con media muestra pestaña Recursos', async ({ page }) => {
    await page.goto('/actividad/ronda-noticias')
    await expect(page.locator('#act-view')).toBeVisible()
    await page.getByRole('button', { name: 'Recursos' }).click()
    await expect(page.getByRole('heading', { name: /Recursos y microlearning/i })).toBeVisible()
    await expect(page.locator('.activity-media-card').first()).toBeVisible()
  })
})
