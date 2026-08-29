export const WHATSAPP_NUMBER = '254714743575'
export const TIKTOK_URL = 'https://www.tiktok.com/@tee_closet019?_r=1&_t=ZS-99GNq7SwXGW'
export const TIKTOK_HANDLE = '@tee_closet019'
export const MAPS_URL = 'https://maps.app.goo.gl/j4b4PoMoxZLZ4mRu9?g_st=ac'
export const SHOP_COORDINATES = { lat: -0.426654, lng: 36.9551 }
export const BRAND_TAGLINE = 'style. confidence. you.'

export function buildGeneralWhatsAppLink(): string {
  const text = encodeURIComponent("Hi Tee Closet! I'd love to know more about your pieces.")
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
