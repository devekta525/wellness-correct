import HeroCarousel from '@/components/HeroCarousel';
import TextSlider from '@/components/TextSlider';
import ProductsSection from '@/components/ProductsSection';
import Banner from '@/components/Banner';
import TestimonialCarousel from '@/components/TestimonialCarousel';

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <TextSlider />
      <ProductsSection />
      <Banner />
      <TestimonialCarousel />
    </main>
  );
}
