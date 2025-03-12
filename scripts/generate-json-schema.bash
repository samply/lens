if [ "$1" = "--check" ]; then
    set -e # Fail immediately if one of the comparisons fails
    ts-json-schema-generator --path packages/lib/src/types/catalogue.ts --type Catalogue | cmp - schema/catalogue.schema.json
else
    ts-json-schema-generator --path packages/lib/src/types/catalogue.ts --type Catalogue > schema/catalogue.schema.json
fi