import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import TextSlider from '@/components/TextSlider';
import ProductsSection from '@/components/ProductsSection';
import Banner from '@/components/Banner';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroCarousel />
        <TextSlider />
        <ProductsSection />
        <Banner />
        <TestimonialCarousel />
      </main>
      <Footer />
    </>
  );
}
