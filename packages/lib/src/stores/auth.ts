/**
 * This stores the current access token used to authenticate with the backend services.
 * NOTE: This is not a general solution and is tailored for deployment with oauth2-proxy.
 */
import { writable } from "svelte/store";

export const authStore = writable<string | null>("");

fetchAccessToken();

export async function fetchAccessToken() {
    const response = await fetch(`/oauth2/auth`, {
        method: "GET",
        credentials: "include",
        
    })
    
    const temporaryToken = response.headers.get("Authorization");

    if (!temporaryToken) {
        console.error("No temporary token found in response headers");
        return;
    }
    console.log('temporaryToken', temporaryToken);
    exchangeCodeForToken(temporaryToken)
    
}

// Placeholder values, replace these with your actual configurations
const clientId = 'bridgehead-test-private';
const clientSecret = 'mmDjwfaoLeTzdRUeGZRDEIaYXgY3zL6r';
const redirectUri = window.location.origin
const tokenEndpoint = 'https://login.verbis.dkfz.de/realms/test-realm-01/protocol/openid-connect/auth';
const refreshTokenTimeInSeconds = 300; // 5 minutes

let accessToken = '';
let refreshToken = '';

// Function to perform the OAuth2 token exchange
async function exchangeCodeForToken(code) {
  const requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'authorization_code');
  requestBody.append('client_id', clientId);
  // requestBody.append('redirect_uri', redirectUri);
  requestBody.append('code', code);

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    const responseData = await response.json();
    accessToken = responseData.access_token;
    refreshToken = responseData.refresh_token;

    console.log('refreshToken', refreshToken);
    console.log('accessToken', accessToken);
    startTokenRefreshTimer();
    return true;
  } catch (error) {
    console.error('Token exchange failed:', error);
    return false;
  }
}

// Function to refresh the access token using the refresh token
async function refreshAccessToken() {
  const requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'refresh_token');
  requestBody.append('client_id', clientId);
  requestBody.append('client_secret', clientSecret);
  requestBody.append('refresh_token', refreshToken);

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    });

    const responseData = await response.json();
    accessToken = responseData.access_token;
    startTokenRefreshTimer();
    console.log('Token refreshed');
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
}

// Function to start the token refresh timer
function startTokenRefreshTimer() {
  setInterval(refreshAccessToken, refreshTokenTimeInSeconds * 1000);
}
