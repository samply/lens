/**
 * This stores the current access token used to authenticate with the backend services.
 * NOTE: This is not a general solution and is tailored for deployment with oauth2-proxy.
 */
import { writable } from "svelte/store";


export const authStore = writable("");

fetchAccessToken();

async function fetchAccessToken() {
    const response = await fetch(
        `/oauth2/auth`,
        {
            method: "GET",
            credentials: "include"
        }
    );
    const authHeader = response.headers.get("Authorization");
    console.log(authHeader)
    authStore.set(authHeader);
}
