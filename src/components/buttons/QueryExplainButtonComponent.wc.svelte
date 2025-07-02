<svelte:options
    customElement={{
        tag: "lens-query-explain-button",
    }}
/>

<script lang="ts">
    import {
        getHumanReadableQuery,
        buildHumanReadableRecursively,
    } from "../../stores/datarequests";
    import { returnNestedValues } from "../../helpers/ast-transformer";
    import type { AstElement } from "../../types/ast";
    import type { QueryItem } from "../../types/queryData";
    import { queryStore } from "../../stores/query";
    import InfoButtonComponent from "./InfoButtonComponent.wc.svelte";

    interface Props {
        noQueryMessage?: string;
        queryItem?: QueryItem | undefined;
    }

    let {
        queryItem = undefined,
        noQueryMessage = "Search for all results",
    }: Props = $props();

    let message: string = $state();

    if (queryItem === undefined) {
        queryStore.subscribe(() => {
            const readable = getHumanReadableQuery();
            message = readable.length > 0 ? readable : noQueryMessage;
        });
    } else {
        const childMessage = buildHumanReadableRecursively(
            returnNestedValues(queryItem) as AstElement,
            "",
        );
        message = childMessage.length > 0 ? childMessage : noQueryMessage;
    }
</script>

<InfoButtonComponent {message}></InfoButtonComponent>
