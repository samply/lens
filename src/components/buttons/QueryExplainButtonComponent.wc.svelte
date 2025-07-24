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
        /** Query explain button in the search bar is smaller, white, and has no border */
        inSearchBar: boolean;
    }

    let {
        queryItem = undefined,
        noQueryMessage = "Search for all results",
        inSearchBar = false,
    }: Props = $props();

    let message: string | undefined = $state();

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

{#if inSearchBar}
    <InfoButtonComponent {message} buttonSize="18px" inSearchBar={true}
    ></InfoButtonComponent>
{:else}
    <div part="lens-query-explain-button">
        <InfoButtonComponent
            {message}
            buttonSize="25px"
            alignDialogue="left"
            dialogueMaxWidth="600px"
        ></InfoButtonComponent>
    </div>
{/if}

<style>
    [part~="lens-query-explain-button"] {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        height: 100%;
        padding: var(--gap-xxs);
        border: solid 1px var(--light-blue);
        border-radius: var(--border-radius-small);
    }
</style>
