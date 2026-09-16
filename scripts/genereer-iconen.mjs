// Genereert de PWA-iconen (een vonk op een warme achtergrond) als PNG.
// Draait zonder externe dependencies: `node scripts/genereer-iconen.mjs`
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const uit = resolve(hier, '../public/icons')

const ACHTERGROND = [20, 19, 15, 255] // #14130f
const VONK = [242, 163, 60, 255] // #f2a33c

function crc32(buf) {
  let c
  const tabel = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabel[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = tabel[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const lengte = Buffer.alloc(4)
  lengte.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([lengte, body, crc])
}

function schrijfPng(pad, breedte, hoogte, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(breedte, 0)
  ihdr.writeUInt32BE(hoogte, 4)
  ihdr[8] = 8 // bitdiepte
  ihdr[9] = 6 // RGBA
  const rijen = []
  for (let y = 0; y < hoogte; y++) {
    rijen.push(Buffer.from([0]), Buffer.from(pixels.subarray(y * breedte * 4, (y + 1) * breedte * 4)))
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rijen), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(pad, png)
}

const meng = (onder, boven, a) => Math.round(onder + (boven - onder) * a)

// Vonk = concave vierpuntige ster (superellipse met exponent < 1).
function vonkDekking(x, y, midden, straal) {
  const dx = Math.abs(x - midden) / straal
  const dy = Math.abs(y - midden) / straal
  return Math.pow(dx, 0.5) + Math.pow(dy, 0.5) <= 1 ? 1 : 0
}

function afgerondeHoek(x, y, maat, radius) {
  const cx = Math.min(Math.max(x, radius), maat - radius)
  const cy = Math.min(Math.max(y, radius), maat - radius)
  return Math.hypot(x - cx, y - cy) <= radius ? 1 : 0
}

function maakIcoon(maat, { maskable = false, transparant = false } = {}) {
  const pixels = Buffer.alloc(maat * maat * 4)
  const radius = maskable ? maat / 2 : maat * 0.22
  const straal = maat * (maskable ? 0.3 : 0.38)
  const midden = maat / 2
  const stalen = 3
  for (let y = 0; y < maat; y++) {
    for (let x = 0; x < maat; x++) {
      let achter = 0
      let vonk = 0
      for (let sy = 0; sy < stalen; sy++) {
        for (let sx = 0; sx < stalen; sx++) {
          const px = x + (sx + 0.5) / stalen
          const py = y + (sy + 0.5) / stalen
          achter += maskable ? 1 : afgerondeHoek(px, py, maat, radius)
          vonk += vonkDekking(px, py, midden, straal)
        }
      }
      achter /= stalen * stalen
      vonk /= stalen * stalen
      const i = (y * maat + x) * 4
      if (transparant) {
        pixels[i] = VONK[0]
        pixels[i + 1] = VONK[1]
        pixels[i + 2] = VONK[2]
        pixels[i + 3] = Math.round(255 * vonk)
      } else {
        pixels[i] = meng(ACHTERGROND[0], VONK[0], vonk)
        pixels[i + 1] = meng(ACHTERGROND[1], VONK[1], vonk)
        pixels[i + 2] = meng(ACHTERGROND[2], VONK[2], vonk)
        pixels[i + 3] = Math.round(255 * achter)
      }
    }
  }
  return pixels
}

mkdirSync(uit, { recursive: true })
const varianten = [
  ['icon-192.png', 192, {}],
  ['icon-512.png', 512, {}],
  ['icon-maskable-512.png', 512, { maskable: true }],
  ['apple-touch-icon.png', 180, { maskable: true }],
  ['favicon-32.png', 32, {}],
]
for (const [naam, maat, opties] of varianten) {
  schrijfPng(resolve(uit, naam), maat, maat, maakIcoon(maat, opties))
  console.log('geschreven:', naam, `${maat}x${maat}`)
}
