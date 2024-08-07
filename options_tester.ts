import optionsSchema from "./packages/lib/src/types/options.schema.json";
import { parser } from "@exodus/schemasafe";

import devOptions from "./packages/demo/public/options-dev.json";
import demoOptions from "./packages/demo/public/options-ccp-demo.json";
import prodOptions from "./packages/demo/public/options-ccp-prod.json";

console.log(
    "Checking Lens options for ",
    import.meta.env.VITE_TARGET_ENVIRONMENT,
);

let options = {};
if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
    options = prodOptions;
} else if (import.meta.env.VITE_TARGET_ENVIRONMENT === "staging") {
    options = demoOptions;
} else {
    options = devOptions;
}

const parse = parser(optionsSchema, {
    includeErrors: true,
    allErrors: true,
});
const validJSON = parse(JSON.stringify(options));
if (validJSON.valid === true) {
    console.log("Options are valid");
} else if (typeof options === "object") {
    console.error(
        "Lens-Options are not conform with the JSON schema",
        validJSON.errors,
    );
    process.exit(1);
}
