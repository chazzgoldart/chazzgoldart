import { CinematicHero } from '../components/CinematicHero';
import { HeroParallaxGallery } from '../components/HeroParallaxGallery';
import { FeaturedArtBoxes } from '../components/FeaturedArtBoxes';
import { ParallaxGallery } from '../components/ParallaxGallery';
import { BioExhibitions } from '../components/BioExhibitions';
import { AvailableMints } from '../components/AvailableMints';
import { GallerySlideshow } from '../components/GallerySlideshow';
import { CollectionsOverview } from '../components/CollectionsOverview';
import { About } from '../components/About';
import { CinematicContact } from '../components/CinematicContact';

export const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <CinematicHero />
      <HeroParallaxGallery />
      <FeaturedArtBoxes />
      <BioExhibitions />
      <AvailableMints />
      <GallerySlideshow />
      <CollectionsOverview />
      <About />
      <CinematicContact />
      <ParallaxGallery />
    </div>
  );
};
