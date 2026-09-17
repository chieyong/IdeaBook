// Genereert de PWA-iconen als PNG: het leadermerk uit de intro — een ring met
// een dradenkruis en een stip in het midden, zoals de aanloop van een filmrol.
// Draait zonder externe dependencies: `node scripts/genereer-iconen.mjs`
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = dirname(fileURLToPath(import.meta.url))
const uit = resolve(hier, '../public/icons')

const PAPIER = [231, 226, 213, 255] // #e7e2d5
const INKT = [21, 21, 15, 255] // #15150f
const VONK = [196, 82, 28, 255] // #c4521c

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

// Het leadermerk, in eenheden van de tegel (0..1 vanaf het midden).
const RING_BUITEN = 0.38
const RING_BINNEN = 0.30
const KRUIS_HALVE_DIKTE = 0.028
const KRUIS_EINDE = 0.5
const VEEG_STRAAL = 0.285
const VEEG_HOEK = Math.PI / 2 // een kwartslag: de wijzer die net langs is gekomen

/** Ring + dradenkruis dat tot aan de rand doorloopt, als een pasmerk. */
function inktDekking(dx, dy) {
  const afstand = Math.hypot(dx, dy)
  if (afstand <= RING_BUITEN && afstand >= RING_BINNEN) return 1
  const horizontaal = Math.abs(dy) <= KRUIS_HALVE_DIKTE && Math.abs(dx) <= KRUIS_EINDE
  const verticaal = Math.abs(dx) <= KRUIS_HALVE_DIKTE && Math.abs(dy) <= KRUIS_EINDE
  return horizontaal || verticaal ? 1 : 0
}

/** De veeg binnen de ring: het kwart dat de wijzer al heeft afgelegd. */
function veegDekking(dx, dy) {
  if (Math.hypot(dx, dy) > VEEG_STRAAL) return 0
  // Hoek vanaf 12 uur, met de klok mee.
  let hoek = Math.atan2(dx, -dy)
  if (hoek < 0) hoek += 2 * Math.PI
  return hoek < VEEG_HOEK ? 1 : 0
}

function afgerondeHoek(x, y, maat, radius) {
  const cx = Math.min(Math.max(x, radius), maat - radius)
  const cy = Math.min(Math.max(y, radius), maat - radius)
  return Math.hypot(x - cx, y - cy) <= radius ? 1 : 0
}

function maakIcoon(maat, { maskable = false } = {}) {
  const pixels = Buffer.alloc(maat * maat * 4)
  const radius = maat * 0.22
  const midden = maat / 2
  // Bij maskable krimpt het merk, zodat het binnen de veilige cirkel blijft.
  const schaal = maat * (maskable ? 0.78 : 1)
  const stalen = 3
  for (let y = 0; y < maat; y++) {
    for (let x = 0; x < maat; x++) {
      let achter = 0
      let inkt = 0
      let veeg = 0
      for (let sy = 0; sy < stalen; sy++) {
        for (let sx = 0; sx < stalen; sx++) {
          const dx = (x + (sx + 0.5) / stalen - midden) / schaal
          const dy = (y + (sy + 0.5) / stalen - midden) / schaal
          achter += maskable ? 1 : afgerondeHoek(x + (sx + 0.5) / stalen, y + (sy + 0.5) / stalen, maat, radius)
          inkt += inktDekking(dx, dy)
          veeg += veegDekking(dx, dy)
        }
      }
      const n = stalen * stalen
      achter /= n
      inkt /= n
      veeg /= n
      // Eerst papier, dan de veeg, dan de inkt van ring en kruis daar bovenop.
      const i = (y * maat + x) * 4
      for (let k = 0; k < 3; k++) {
        const metVeeg = meng(PAPIER[k], VONK[k], veeg)
        pixels[i + k] = meng(metVeeg, INKT[k], inkt)
      }
      pixels[i + 3] = Math.round(255 * achter)
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
