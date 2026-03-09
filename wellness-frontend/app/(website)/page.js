import HeroCarousel from '@/components/HeroCarousel';
import TextSlider from '@/components/TextSlider';
import ProductsSection from '@/components/ProductsSection';
import Banner from '@/components/Banner';
import BlogSection from '@/components/BlogSection';
import TestimonialCarousel from '@/components/TestimonialCarousel';

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroCarousel />
      <TextSlider />
      <ProductsSection />
      <Banner />
      <BlogSection />
      <TestimonialCarousel />
    </main>
  );
}
