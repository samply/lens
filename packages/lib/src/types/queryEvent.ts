import type { AstTopLayer } from "./ast";
import type { Site } from "./response";

export interface QueryEvent extends Event {
    detail: {
        ast: AstTopLayer;
        updateResponse: (response: Map<string, Site>) => void;
        abortController?: AbortController;
    };
}
