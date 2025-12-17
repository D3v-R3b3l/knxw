import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "688aa91c44a8979a009301be", 
  requiresAuth: true // Ensure authentication is required for all operations
});
