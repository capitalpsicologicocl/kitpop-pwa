/**
 * Genera favicons PNG/ICO desde assets/kitpop-favicon.svg
 * Uso: node scripts/generate-favicons.mjs
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceSvg = join(root, 'assets/kitpop-favicon.svg')
const svgBuffer = readFileSync(sourceSvg)

const targets = [
  { path: 'public/favicon-32.png', size: 32 },
  { path: 'public/apple-touch-icon-180x180.png', size: 180 },
  { path: 'public/pwa-64x64.png', size: 64 },
  { path: 'public/pwa-192x192.png', size: 192 },
  { path: 'public/pwa-512x512.png', size: 512 },
  { path: 'public/maskable-icon-512x512.png', size: 512, padding: 0.12 },
  { path: 'landing/favicon-32.png', size: 32 },
  { path: 'landing/apple-touch-icon.png', size: 180 },
]

async function renderPng(size, padding = 0) {
  const inset = Math.round(size * padding)
  const inner = size - inset * 2
  const png = await sharp(svgBuffer)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: inset,
      bottom: inset,
      left: inset,
      right: inset,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer()
  return png
}

for (const target of targets) {
  const png = await renderPng(target.size, target.padding ?? 0)
  writeFileSync(join(root, target.path), png)
  console.log('wrote', target.path)
}

const icoSizes = [16, 32, 48]
const icoBuffers = await Promise.all(icoSizes.map((size) => renderPng(size)))
const ico = await pngToIco(icoBuffers)
writeFileSync(join(root, 'public/favicon.ico'), ico)
writeFileSync(join(root, 'landing/favicon.ico'), ico)

copyFileSync(sourceSvg, join(root, 'public/favicon.svg'))
copyFileSync(sourceSvg, join(root, 'landing/favicon.svg'))

console.log('Done — favicons synced to public/ and landing/')
