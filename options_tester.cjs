"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var options_schema_json_1 = __importDefault(require("./packages/lib/src/interfaces/options.schema.json"));
var schemasafe_1 = require("@exodus/schemasafe");
var options_json_1 = __importDefault(require("./packages/demo/public/options.json"));
console.log("Checking Lens options");
var parse = (0, schemasafe_1.parser)(options_schema_json_1.default, {
    includeErrors: true,
    allErrors: true,
});
var validJSON = parse(JSON.stringify(options_json_1.default));
if (validJSON.valid === true) {
    console.log("Options are valid");
}
else if (typeof options_json_1.default === "object") {
    console.error("Lens-Options are not conform with the JSON schema", validJSON.errors);
    process.exit(1);
}
