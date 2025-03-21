if [ "$1" = "--check" ]; then
    set -e # Fail immediately if one of the comparisons fails
    npx ts-json-schema-generator --path src/types/catalogue.ts --type Catalogue | cmp - schema/catalogue.schema.json
else
    npx ts-json-schema-generator --path src/types/catalogue.ts --type Catalogue > schema/catalogue.schema.json
fi