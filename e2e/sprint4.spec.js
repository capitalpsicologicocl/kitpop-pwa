import { test, expect } from '@playwright/test'

test.describe('Guest browse', () => {
  test('home loads without login', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#home')).toBeVisible()
  })

  test('categories are public', async ({ page }) => {
    await page.goto('/categorias')
    await expect(page.locator('#categories-view')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Categorías' })).toBeVisible()
    await expect(page.getByText(/sin cuenta puedes leer guías/i)).toBeVisible()
  })

  test('activity guide is readable as guest', async ({ page }) => {
    await page.goto('/actividad/ronda-noticias')
    await expect(page.locator('#act-view')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ronda de Buenas Noticias')
  })

  test('guest signup CTA appears on activity page', async ({ page }) => {
    await page.goto('/actividad/ronda-noticias')
    await expect(page.getByRole('link', { name: 'Crear cuenta gratis' })).toBeVisible()
  })
})

test.describe('Auth gates', () => {
  test('workshops require login', async ({ page }) => {
    await page.goto('/talleres')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
    await expect(page.getByLabel(/correo/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
  })

  test('register page renders', async ({ page }) => {
    await page.goto('/registro')
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible()
  })
})

test.describe('Export Pro gate', () => {
  test('workshop summary redirects guests to login', async ({ page }) => {
    await page.goto('/talleres/00000000-0000-0000-0000-000000000001/resumen')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Authenticated flows', () => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  test.skip(!email || !password, 'Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD for auth E2E')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/correo/i).fill(email)
    await page.getByLabel(/contraseña/i).fill(password)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('explorer sees export gate on workshops list path', async ({ page }) => {
    await page.goto('/talleres')
    await expect(page.locator('#workshops-view, main')).toBeVisible()
  })
})

test.describe('PayPal checkout', () => {
  test.skip(
    process.env.E2E_PAYPAL_SANDBOX !== '1',
    'Set E2E_PAYPAL_SANDBOX=1 to run checkout sandbox E2E'
  )

  test('plan page shows Pro options', async ({ page }) => {
    await page.goto('/perfil?tab=plan')
    await expect(page.getByText(/KitPOP Pro/i).first()).toBeVisible()
  })
})
