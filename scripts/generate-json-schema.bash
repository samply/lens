if [ "$1" = "--check" ]; then
    set -e # Fail immediately if one of the comparisons fails
    ts-json-schema-generator --path packages/lib/src/types/catalogue.ts --type Catalogue | cmp - packages/lib/src/types/catalogue.schema.json
else
    ts-json-schema-generator --path packages/lib/src/types/catalogue.ts --type Catalogue > packages/lib/src/types/catalogue.schema.json
fi