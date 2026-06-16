import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Admin } from '../pages/Admin';
import { Blog, BlogPost } from '../pages/Blog';
import { Gallery } from '../pages/Gallery';
import Events from '../pages/Events';
import EventGallery from '../pages/EventGallery';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function EventsSubdomainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/events/:slug" element={<EventGallery />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function MainSiteRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/gallery" element={<Gallery />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:slug" element={<EventGallery />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default function SubdomainRouter() {
  const hostname = window.location.hostname;
  const isEventsSubdomain = hostname.startsWith('events.');

  if (isEventsSubdomain) {
    return <EventsSubdomainRouter />;
  }

  return <MainSiteRouter />;
}
