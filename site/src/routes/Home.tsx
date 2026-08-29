import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero } from '@/components/home/Hero'
import { NewStockStrip } from '@/components/home/NewStockStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { WhyTeeCloset } from '@/components/home/WhyTeeCloset'
import { VisitStore } from '@/components/home/VisitStore'
import { SocialProof } from '@/components/home/SocialProof'
import { WhatsAppBand } from '@/components/home/WhatsAppBand'
import { Seo } from '@/components/seo/Seo'

export function Home() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) return
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <>
      <Seo
        title="Home"
        description="Tee Closet — style. confidence. you. Shop wide-leg pants, blazers, tops, official pants, chinos and palazzo pants in Kenya."
      />
      <Hero />
      <NewStockStrip />
      <CategoryGrid />
      <FeaturedGrid />
      <WhyTeeCloset />
      <VisitStore />
      <SocialProof />
      <WhatsAppBand />
    </>
  )
}
