<svelte:options customElement="button-component" />

<script>
    import {count} from './store'
    export let label = 'Click me';
    export let reset = false;
    export let onClick = () => {
        if(reset)
            count.update(n => 0)
        else
        count.update(n => n + 1)
    }
</script>

<button on:click={onClick}>{label}</button>