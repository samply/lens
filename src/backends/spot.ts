export type BeamResult = {
    body: string;
    from: string;
    status: "claimed" | "succeeded" | "tempfailed" | "permafailed";
    task: string;
    to: string[];
};

/**
 * Use the spot API to create a beam task and listen for results.
 *
 * @param url The base URL of the Spot API
 * @param sites An array of sites to query
 * @param query The query to execute
 * @param signal An AbortSignal to cancel the request
 * @param resultCallback A callback function to handle each result
 */
export async function createBeamTask(
    url: string,
    sites: string[],
    query: string,
    signal: AbortSignal,
    resultCallback: (result: BeamResult) => void,
): Promise<void> {
    url = url.endsWith("/") ? url : url + "/";
    const id = crypto.randomUUID();

    const beamTaskResponse = await fetch(
        `${url}beam?sites=${sites.join(",")}`,
        {
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
        },
    );

    if (!beamTaskResponse.ok) {
        const error = await beamTaskResponse.text();
        throw new Error(`Failed to start beam task: ${error}`);
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
        const result: BeamResult = JSON.parse(message.data);
        resultCallback(result);
    });
}
