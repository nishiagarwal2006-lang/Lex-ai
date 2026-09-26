import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import BackgroundOrbs from './components/layout/BackgroundOrbs.jsx';
import Home from './pages/Home.jsx';
import Analyze from './pages/Analyze.jsx';
import Compare from './pages/Compare.jsx';
import QA from './pages/QA.jsx';
import ApiKeySetup from './components/ui/ApiKeySetup.jsx';

/** True when the Groq API key is present and not a placeholder. */
const hasApiKey = Boolean(
  import.meta.env.VITE_GROQ_API_KEY &&
  import.meta.env.VITE_GROQ_API_KEY !== 'your_groq_api_key_here'
);

export default function App() {
  return (
    <AuthProvider>
      {/* Skip-navigation link for keyboard / screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-neon-indigo focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <div className="app-perspective relative min-h-screen">
        <BackgroundOrbs />
        <Navbar />

        <main
          id="main-content"
          className="relative z-10 pt-20"
          role="main"
          aria-label="LexAI application content"
        >
          {hasApiKey ? (
            <Routes>
              <Route path="/"        element={<Home />}    />
              <Route path="/analyze" element={<Analyze />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/qa"      element={<QA />}      />
            </Routes>
          ) : (
            <ApiKeySetup />
          )}
        </main>

        <Footer />
      </div>

      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15,15,25,0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(99,102,241,0.3)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </AuthProvider>
  );
}
