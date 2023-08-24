<script lang="ts">
  import '../../lib';
</script>

<main>
  <p class="container">
    <button-component label="Click me"></button-component>
    <button-component label="Don't click me" reset="true"></button-component>
    <display-component></display-component>
  </p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }

    .container {
      display: inline-block;
      max-width: 320px;
    }
  }
</style>