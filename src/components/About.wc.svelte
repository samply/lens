<svelte:options
    customElement={{
        tag: "about-lens",
    }}
/>

<script lang="ts">
    import pkg from "../../package.json";
    import confetti from "canvas-confetti";

    const version = pkg.version;

    function launchConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 1 },
        });
    }
</script>

<div>
    Made with <button onclick={launchConfetti} class="heart-button" title="Version: v{version}">♥</button> and
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