import { v4 as uuidv4 } from "uuid";

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
 * @param url The base URL of the Spot API
 * @param sites An array of sites to query
 * @param query The query to execute
 * @param signal An AbortSignal to cancel the request
 * @param resultCallback A callback function to handle each result
 */
export async function querySpot(
    url: string,
    sites: string[],
    query: string,
    signal: AbortSignal,
    resultCallback: (result: SpotResult) => void,
): Promise<void> {
    url = url.endsWith("/") ? url : url + "/";
    const id = uuidv4();

    const response = await fetch(`${url}beam?sites=${sites.join(",")}`, {
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
    });

    if (!response.ok) {
        if (response.redirected) {
            // If the response is a redirect the user is likely not logged in
            // and we should reload the page to redirect them to the login page.
            window.location.reload();
        }

        const error = await response.text();
        throw new Error(`Failed to send query: ${error}`);
    }

    const eventSource = new EventSource(
        `${url}beam/${id}?wait_count=${sites.length}`,
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
