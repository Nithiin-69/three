import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// AGGRESSIVE ResizeObserver error suppression
// These are harmless React warnings from rapid component resizing
const suppressResizeObserver = () => {
  // Suppress at window level
  const resizeObserverLoopErr = /ResizeObserver loop/;
  window.addEventListener('error', (e) => {
    if (resizeObserverLoopErr.test(e.message || e.error?.message || '')) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  });

  // Suppress console errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && resizeObserverLoopErr.test(message)) {
      return;
    }
    originalError.apply(console, args);
  };

  // Override ResizeObserver to catch errors
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };
};

suppressResizeObserver();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
