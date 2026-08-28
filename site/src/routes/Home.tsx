import { Hero } from '@/components/home/Hero'
import { NewStockStrip } from '@/components/home/NewStockStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedGrid } from '@/components/home/FeaturedGrid'
import { WhyTeeCloset } from '@/components/home/WhyTeeCloset'
import { VisitStore } from '@/components/home/VisitStore'
import { SocialProof } from '@/components/home/SocialProof'
import { WhatsAppBand } from '@/components/home/WhatsAppBand'

export function Home() {
  return (
    <>
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
