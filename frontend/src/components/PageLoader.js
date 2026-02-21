import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';

const PageLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    // Show loader when route changes
    if (location.pathname !== displayLocation.pathname) {
      setLoading(true);
      
      // Minimum 5 second loading animation
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setLoading(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-[9999] flex items-center justify-center"
          >
            <div className="text-center">
              <Loader size="150px" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground tracking-apple mt-6 text-lg font-medium"
              >
                Loading...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={displayLocation.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PageLoader;
