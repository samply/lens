# Translations

Lens supports English and German language out of the box. You can set the language to `en` or `de` in the Lens options:

```json
"language": "de"
```

## Overwriting texts

You can overwrite the [built-in translations](https://github.com/samply/lens/blob/main/src/helpers/translations.ts) in the Lens options to customize the text:

```json
"texts": {
    "loading": {
        "en": "Processing..."
    }
}
```

Or add translations for new languages:

```json
"texts": {
    "loading": {
        "es": "Cargando..."
    }
}
```

Or you can add your own texts that you can then translate in your application. We recommend that you prefix the key with your project name to avoid collisions:

```json
"texts": {
    "ccp-welcome": {
        "en": "Welcome to CCP Explorer!",
        "de": "Willkommen beim CCP Explorer!"
    }
}
```

## Using translations in your application

You can also use the translations in your application:

```html
<script lang="ts">
    import { translate } from "@samply/lens";
</script>

<span>{translate("loading")}</span>
```
