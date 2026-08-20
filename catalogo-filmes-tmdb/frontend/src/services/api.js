import axios from 'axios';

const api = axios.create({
  // Since the backend is running on 3000 locally (or external server), we'll use a relative path
  // and set up a proxy in Vite, or use full URL. For now, we'll try relative to let proxy handle it.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // important for cookies (auth)
});

export default api;
