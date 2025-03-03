set -e # Fail immediately if one of the validations fails
ajv validate -c ajv-formats -s packages/lib/src/types/options.schema.json -d packages/demo/public/options-ccp-demo.json
ajv validate -c ajv-formats -s packages/lib/src/types/options.schema.json -d packages/demo/public/options-ccp-prod.json
ajv validate -c ajv-formats -s packages/lib/src/types/options.schema.json -d packages/demo/public/options-dev.json
ajv validate -c ajv-formats -s packages/lib/src/types/catalogue.schema.json -d packages/demo/public/catalogues/catalogue-dktk-staging.json
ajv validate -c ajv-formats -s packages/lib/src/types/catalogue.schema.json -d packages/demo/public/catalogues/catalogue-dktk-with-mol-markers.json
ajv validate -c ajv-formats -s packages/lib/src/types/catalogue.schema.json -d packages/demo/public/catalogues/catalogue-dktk.json
ajv validate -c ajv-formats -s packages/lib/src/types/catalogue.schema.json -d packages/demo/public/catalogues/catalogue-example.json
