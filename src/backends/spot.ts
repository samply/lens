import { lensOptions } from "../stores/options";
import { v4 as uuidv4 } from "uuid";
import { get } from "svelte/store";

export type SpotResult = {
    body: string;
    from: string;
    status: "claimed" | "succeeded" | "tempfailed" | "permafailed";
    task: string;
    to: string[];
};

/**
 * Use the spot API to send a query and listen for results.
 *
 * @param query The query to execute
 * @param signal An AbortSignal to cancel the request
 * @param resultCallback A callback function to handle each result
 */
export async function querySpot(
    query: string,
    signal: AbortSignal,
    resultCallback: (result: SpotResult) => void,
): Promise<void> {
    const url = get(lensOptions)?.spotUrl?.replace(/\/$/, "");
    if (!url) {
        throw new Error("Spot URL is not set in options.");
    }
    // If sites are not defined, we don't send them and Spot determines the sites to query
    const sites = get(lensOptions)?.sitesToQuery;
    const id = uuidv4();

    const response = await fetch(`${url}/beam`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            id,
            sites,
            query,
        }),
        redirect: "manual", // Used to detect redirects
    });

    if (response.type === "opaqueredirect") {
        // If the response is a redirect, it means the user is not logged in
        // and we should reload the page to redirect them to the login page.
        window.location.reload();
    }

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send query: ${error}`);
    }

    const eventSource = new EventSource(
        `${url}/beam/${id}` +
            (sites !== undefined ? `?wait_count=${sites.length}` : ""),
        {
            withCredentials: true,
        },
    );

    eventSource.addEventListener("error", () => {
        // Server closed the connection, which is expected when all sites have responded
        eventSource.close();
    });

    signal.addEventListener("abort", () => {
        eventSource.close();
    });

    eventSource.addEventListener("new_result", (message) => {
        const result: SpotResult = JSON.parse(message.data);
        resultCallback(result);
    });
}
