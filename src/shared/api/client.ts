import axios from 'axios';

// Always same-origin. Requests are routed to their real upstream (Dog CEO,
// TheDogAPI, ...) by the dev-server proxy in vite.config.ts, which is also
// where secrets like x-api-key get attached — never here in client code.
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  withCredentials: true,
});
