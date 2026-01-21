if [ "$1" = "--check" ]; then
    set -e # Fail immediately if one of the comparisons fails
    npx ts-json-schema-generator --path src/lib/types/catalogue.ts --type Catalogue | cmp - src/lib/schema/catalogue.schema.json
    npx ts-json-schema-generator --path src/lib/types/options.ts --type LensOptions | cmp - src/lib/schema/options.schema.json
else
    npx ts-json-schema-generator --path src/lib/types/catalogue.ts --type Catalogue > src/lib/schema/catalogue.schema.json
    npx ts-json-schema-generator --path src/lib/types/options.ts --type LensOptions > src/lib/schema/options.schema.json
fi
