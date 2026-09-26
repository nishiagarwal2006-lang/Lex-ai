import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import NeonButton from '../components/ui/NeonButton.jsx';

/**
 * 404 Not Found page — rendered for any unmatched route.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md p-12"
      >
        <p className="font-mono text-6xl font-bold gradient-text" aria-hidden="true">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link to="/">
            <NeonButton variant="primary" className="flex items-center gap-2">
              Back to Home <ArrowRight className="h-4 w-4" />
            </NeonButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
