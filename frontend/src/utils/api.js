// API utility with automatic session management
import axios from 'axios';
import { getSessionId } from './session';

// Use relative path for API calls - Kubernetes ingress routes /api to backend
const API_BASE = '/api';

/**
 * Create an axios instance with session ID automatically included
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add session ID to every request
apiClient.interceptors.request.use((config) => {
  config.headers['X-Session-ID'] = getSessionId();
  return config;
});

export default apiClient;
