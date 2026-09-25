import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import BackgroundOrbs from './components/layout/BackgroundOrbs.jsx';
import Home from './pages/Home.jsx';
import Analyze from './pages/Analyze.jsx';
import Compare from './pages/Compare.jsx';
import QA from './pages/QA.jsx';

export default function App() {
  return (
    <div className="app-perspective relative min-h-screen">
      <BackgroundOrbs />
      <Navbar />
      <main className="relative z-10 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/qa" element={<QA />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
