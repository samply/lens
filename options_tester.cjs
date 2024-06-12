"use strict";
const __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

console.log(
    "Checking Lens options for ",
    process.env.VITE_TARGET_ENVIRONMENT,
);

let optionsPath = "";
if (process.env.VITE_TARGET_ENVIRONMENT === "production") {
    optionsPath = "./packages/demo/public/options-ccp-prod.json";
} else if (process.env.VITE_TARGET_ENVIRONMENT === "staging") {
    optionsPath = "./packages/demo/public/options-ccp-demo.json";
} else {
    optionsPath = "./packages/demo/public/options-dev.json";
}

Object.defineProperty(exports, "__esModule", { value: true });
const options_schema_json_1 = __importDefault(require("./packages/lib/src/types/options.schema.json"));
const schemasafe_1 = require("@exodus/schemasafe");
const options_json_1 = __importDefault(require(optionsPath));
console.log("Checking Lens options");
const parse = (0, schemasafe_1.parser)(options_schema_json_1.default, {
    includeErrors: true,
    allErrors: true,
});
const validJSON = parse(JSON.stringify(options_json_1.default));
if (validJSON.valid === true) {
    console.log("Options are valid");
}
else if (typeof options_json_1.default === "object") {
    console.error("Lens-Options are not conform with the JSON schema", validJSON.errors);
    process.exit(1);
}
