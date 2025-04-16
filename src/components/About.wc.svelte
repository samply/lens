<svelte:options
    customElement={{
        tag: "about-lens",
    }}
/>

<script lang="ts">
    import pkg from "../../package.json";
    const version = pkg.version;
</script>

<div>
    Made with <button class="heart-button" title="Version: v{version}">♥</button> and
    <a href="https://github.com/samply/lens">samply/lens</a>.
</div>


<style>
    .heart-button {
      all: unset; /* removes button styles */
      cursor: pointer;
      color: #000000;
      font-size: 1.2em;
      font-family: inherit;
      line-height: 1;
      transition: color 0.2s;
    }
  
    .heart-button:hover {
      color: #000000;
    }
  
    .heart-button:focus {
      outline: none;
      text-decoration: underline;
    }
</style>