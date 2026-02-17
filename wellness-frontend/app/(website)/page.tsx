import HeroSection from '@/components/home/hero-section'
// import AboutSection from '@/components/home/about-section'
// import StatsSection from '@/components/home/stats-section'
// import TestimonialSection from '@/components/home/testimonial-section'
// import ProductSection from '@/components/home/product-section'
// import DoctorsSection from '@/components/home/doctors-section'
import EcosystemSection from '@/components/home/ecosystem-section'
import FeaturesBar from '@/components/home/features-bar'
import BenchmarkSection from '@/components/home/benchmark-section'
import LiveLimitlessSection from '@/components/home/live-limitless-section'
import ComboPacksSection from '@/components/home/combo-packs-section'
import IngredientScienceSection from '@/components/home/ingredient-science-section'
import FeaturedCollectionSection from '@/components/home/featured-collection-section'
import TestimonialsCarouselSection from '@/components/home/testimonials-carousel-section'

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <div className="relative z-10 bg-gradient-to-b from-blue-50/50 to-white dark:bg-slate-950">
        <EcosystemSection />
        <FeaturesBar />
        <BenchmarkSection />
        {/* <LiveLimitlessSection /> */}
        {/* <ComboPacksSection /> */}
        {/* <IngredientScienceSection /> */}
        {/* <TestimonialsCarouselSection /> */}
        <FeaturedCollectionSection />
      </div>
      {/* <StatsSection />
      <AboutSection />
      <ProductSection />
      <DoctorsSection />
      <TestimonialSection /> */}
    </div>
  )
}

export default HomePage