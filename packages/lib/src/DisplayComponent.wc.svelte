<svelte:options customElement='display-component'/>

<script>
    import {count} from './store'
</script>

<h1>{$count}</h1>