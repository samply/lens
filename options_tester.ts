import optionsSchema from "./packages/lib/src/interfaces/options.schema.json";
import { parser } from "@exodus/schemasafe";

import options from "./packages/demo/public/options.json";

console.log("Checking Lens options");

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
