import { describe, expect, it } from 'vitest'
import { WHATSAPP_NUMBER, TIKTOK_URL, MAPS_URL, SHOP_COORDINATES, buildGeneralWhatsAppLink } from './constants'

describe('brand constants', () => {
  it('match the values provided by the brand owner exactly', () => {
    expect(WHATSAPP_NUMBER).toBe('254714713575')
    expect(TIKTOK_URL).toBe('https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW')
    expect(MAPS_URL).toBe('https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac')
    expect(SHOP_COORDINATES).toEqual({ lat: -0.426654, lng: 36.9551 })
  })

  it('builds a general WhatsApp chat link', () => {
    expect(buildGeneralWhatsAppLink()).toMatch(/^https:\/\/wa\.me\/254714713575\?text=/)
  })
})
