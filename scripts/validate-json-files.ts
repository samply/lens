import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { AnySchema } from "ajv";

type ValidationTarget = {
    jsonPath: string;
    schemaPath: string;
};

const projectRoot = process.cwd();

const validationTargets: ValidationTarget[] = [
    {
        jsonPath: "demo-catalogue.json",
        schemaPath: "schema/catalogue.schema.json",
    },
];

function readJson(filePath: string): unknown {
    const content = readFileSync(filePath, "utf8");
    return JSON.parse(content);
}

function readSchema(filePath: string): AnySchema {
    return readJson(filePath) as AnySchema;
}

function validateAllTargets(): void {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    let failedValidations = 0;

    for (const target of validationTargets) {
        try {
            const schema = readSchema(resolve(projectRoot, target.schemaPath));
            const data = readJson(resolve(projectRoot, target.jsonPath));

            const validate = ajv.compile(schema);
            const valid = validate(data);

            if (!valid) {
                failedValidations += 1;
                const details = JSON.stringify(validate.errors, null, 2);
                console.error(
                    `Validation failed for ${target.jsonPath} against ${target.schemaPath}:\n${details}`,
                );
                continue;
            }

            console.log(
                `${target.jsonPath} is valid against ${target.schemaPath}`,
            );
        } catch (error) {
            failedValidations += 1;
            console.error(
                `Validation failed for ${target.jsonPath} against ${target.schemaPath}:`,
            );
            console.error(error);
        }
    }

    if (failedValidations > 0) {
        process.exitCode = 1;
        console.error(`Validation failed for ${failedValidations} file(s).`);
    } else {
        console.log("All configured JSON files are valid.");
    }
}

validateAllTargets();
