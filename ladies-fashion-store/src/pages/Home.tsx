import React from 'react';

import { Hero } from '../components/Hero';
import { Reviews } from '../components/Reviews';
import { InstagramGallery } from '../components/InstagramGallery';

export const Home: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Banner Slideshow */}
      <Hero />

      {/* Testimonials section */}
      <Reviews />

      {/* Instagram Gallery social wall */}
      <InstagramGallery />
    </div>
  );
};
