import React from 'react';

import { Hero } from '../components/Hero';
import { FeaturedCollections } from '../components/FeaturedCollections';

import { Reviews } from '../components/Reviews';
import { InstagramGallery } from '../components/InstagramGallery';

export const Home: React.FC = () => {



  return (
    <div className="w-full">
      {/* Hero Banner Slideshow */}
      <Hero />

      <FeaturedCollections />

      {/* Testimonials section */}
      <Reviews />

      {/* Instagram Gallery social wall */}
      <InstagramGallery />
    </div>
  );
};
