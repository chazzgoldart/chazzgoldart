import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Image, Plus, FileText, User, ImageIcon, Images, Link2, MessagesSquare, Layers, Box, BookImage, Calendar, Eye, Download } from 'lucide-react';
import { ArtworkManager } from '../components/admin/ArtworkManager';
import { PlatformManager } from '../components/admin/PlatformManager';
import { CollectionManager } from '../components/admin/CollectionManager';
import { BlogManager } from '../components/admin/BlogManager';
import { ArtistSectionManager } from '../components/admin/ArtistSectionManager';
import { SlideshowManager } from '../components/admin/SlideshowManager';
import { HeroSlideshowManager } from '../components/admin/HeroSlideshowManager';
import { GallerySlideshowManager } from '../components/admin/GallerySlideshowManager';
import { HeroParallaxGalleryManager } from '../components/admin/HeroParallaxGalleryManager';
import { SocialLinksManager } from '../components/admin/SocialLinksManager';
import { ContactLinksManager } from '../components/admin/ContactLinksManager';
import { FeaturedArtBoxesManager } from '../components/admin/FeaturedArtBoxesManager';
import { GalleryManager } from '../components/admin/GalleryManager';
import EventsManager from '../components/admin/EventsManager';
import ExhibitionsManager from '../components/admin/ExhibitionsManager';
import PhotoModerationManager from '../components/admin/PhotoModerationManager';

import GoogleDriveSyncManager from '../components/admin/GoogleDriveSyncManager';

type Tab = 'artworks' | 'platforms' | 'hero' | 'parallax' | 'slideshow' | 'gallery' | 'collections' | 'blog' | 'blog-gallery' | 'artist' | 'exhibitions' | 'social' | 'contact' | 'featured-boxes' | 'events' | 'photos' | 'drive-sync' | 'auto-sync';

export const Admin = () => {
  const { user, session, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('artworks');
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') && params.has('state')) {
      setIsOAuthCallback(true);
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = session?.user?.app_metadata?.is_admin === true;

  if (loading || isOAuthCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-3xl font-black mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-6">You do not have permission to access this page.</p>
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <header className="glass-card border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black">
            Portfolio <span className="text-neon-cyan">Admin</span>
          </h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full hover:border-pink-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'artworks'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Artworks
            </div>
          </button>
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'platforms'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Platforms
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hero'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Hero Slideshow
            </div>
          </button>
          <button
            onClick={() => setActiveTab('parallax')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'parallax'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Parallax Gallery
            </div>
          </button>
          <button
            onClick={() => setActiveTab('slideshow')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'slideshow'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Featured Slideshow
            </div>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Images className="w-4 h-4" />
              Gallery Slideshow
            </div>
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'collections'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            Collections
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'blog'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Blog
            </div>
          </button>
          <button
            onClick={() => setActiveTab('blog-gallery')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'blog-gallery'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookImage className="w-4 h-4" />
              Blog Gallery
            </div>
          </button>
          <button
            onClick={() => setActiveTab('artist')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'artist'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Artist Section
            </div>
          </button>
          <button
            onClick={() => setActiveTab('exhibitions')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'exhibitions'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Exhibitions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'social'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Social Links
            </div>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessagesSquare className="w-4 h-4" />
              Contact Links
            </div>
          </button>
          <button
            onClick={() => setActiveTab('featured-boxes')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'featured-boxes'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Featured Art Boxes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </div>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'photos'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Photo Moderation
            </div>
          </button>
          <button
            onClick={() => setActiveTab('auto-sync')}
            className={`px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap ${
              activeTab === 'auto-sync'
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 glow-cyan'
                : 'glass-card hover:border-cyan-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Auto-Sync Setup
            </div>
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {activeTab === 'artworks' && <ArtworkManager />}
          {activeTab === 'platforms' && <PlatformManager />}
          {activeTab === 'hero' && <HeroSlideshowManager />}
          {activeTab === 'parallax' && <HeroParallaxGalleryManager />}
          {activeTab === 'slideshow' && <SlideshowManager />}
          {activeTab === 'gallery' && <GallerySlideshowManager />}
          {activeTab === 'collections' && <CollectionManager />}
          {activeTab === 'blog' && <BlogManager />}
          {activeTab === 'blog-gallery' && <GalleryManager />}
          {activeTab === 'artist' && <ArtistSectionManager />}
          {activeTab === 'exhibitions' && <ExhibitionsManager />}
          {activeTab === 'social' && <SocialLinksManager />}
          {activeTab === 'contact' && <ContactLinksManager />}
          {activeTab === 'featured-boxes' && <FeaturedArtBoxesManager />}
          {activeTab === 'events' && <EventsManager />}
          {activeTab === 'photos' && <PhotoModerationManager />}
          {activeTab === 'auto-sync' && <GoogleDriveSyncManager />}
        </div>
      </div>
    </div>
  );
};
