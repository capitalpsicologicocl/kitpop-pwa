import { test, expect } from '@playwright/test'

import { getAuthE2ESkipReason, waitForActivityPage } from './helpers/auth.js'

const authSkipReason = getAuthE2ESkipReason()

test.describe('Sprint 7 — Auth workshop export gate', () => {
  test.skip(Boolean(authSkipReason), authSkipReason ?? '')

  test('login → talleres → resumen muestra gate Pro o exports', async ({ page }) => {
    await page.goto('/talleres')
    await expect(page.locator('#workshops-view')).toBeVisible()
    await expect(page.getByText(/cargando/i)).toHaveCount(0, { timeout: 20_000 })

    const editLink = page.getByRole('link', { name: 'Editar diseño' }).first()

    if (await editLink.count()) {
      await editLink.click()
    } else {
      const title = `E2E Taller ${Date.now()}`
      await page.getByLabel(/nombre del taller/i).fill(title)
      await page.getByRole('button', { name: /crear taller/i }).click()
    }

    await expect(page).toHaveURL(/\/talleres\/[0-9a-f-]+/, { timeout: 30_000 })

    const workshopId = page.url().match(/\/talleres\/([0-9a-f-]+)/)?.[1]
    expect(workshopId).toBeTruthy()

    await page.goto(`/talleres/${workshopId}/resumen`)
    await expect(page.locator('#workshops-view')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 })

    const proGate = page.locator('.export-pro-gate')
    const exportActions = page.locator('.export-actions')

    await expect(proGate.or(exportActions)).toBeVisible({ timeout: 20_000 })

    if (await proGate.isVisible()) {
      await expect(proGate.getByRole('heading', { name: /KitPOP Pro/i })).toBeVisible()
      await expect(proGate.getByRole('link', { name: /Ver planes Pro/i })).toBeVisible()
    } else {
      await expect(exportActions.getByRole('button', { name: /Descargar Word/i })).toBeVisible()
      await expect(exportActions.getByRole('button', { name: /Descargar PDF/i })).toBeVisible()
    }
  })

  test('actividad PERMA con media muestra pestaña Recursos', async ({ page }) => {
    await waitForActivityPage(page, 'ronda-noticias', /Ronda de Buenas Noticias/i)

    const recursosTab = page.getByRole('button', { name: 'Recursos' })
    await expect(recursosTab).toBeVisible({ timeout: 15_000 })
    await recursosTab.click()

    await expect(page.getByRole('heading', { name: /Recursos y microlearning/i })).toBeVisible()
    await expect(page.locator('.activity-media-card').first()).toBeVisible()
  })
})
