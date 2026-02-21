import React, { useEffect } from 'react';

const LottieLoader = ({ 
  src = "https://lottie.host/1d0d27ed-bd7e-469a-b3f3-39bcdc9edbce/OZk04ELKeY.lottie",
  width = "300px",
  height = "300px",
  className = ""
}) => {
  useEffect(() => {
    // Load dotlottie-wc script if not already loaded
    if (!window.customElements.get('dotlottie-wc')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js';
      script.type = 'module';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <dotlottie-wc 
        src={src}
        style={{ width, height }}
        autoplay
        loop
      />
    </div>
  );
};

export default LottieLoader;
