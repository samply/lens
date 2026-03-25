import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { createGenerator } from "ts-json-schema-generator";

type SchemaConfig = {
    sourcePath: string;
    sourceType: string;
    schemaPath: string;
};

const projectRoot = process.cwd();
const checkMode = process.argv.includes("--check");

const schemas: SchemaConfig[] = [
    {
        sourcePath: "src/types/catalogue.ts",
        sourceType: "LensCatalogue",
        schemaPath: "schema/catalogue.schema.json",
    },
    {
        sourcePath: "src/types/options.ts",
        sourceType: "LensOptions",
        schemaPath: "schema/options.schema.json",
    },
];

function generateSchema(sourcePath: string, sourceType: string): string {
    const generator = createGenerator({
        path: resolve(projectRoot, sourcePath),
        tsconfig: resolve(projectRoot, "tsconfig.json"),
        type: sourceType,
    });

    const schema = generator.createSchema(sourceType);
    return `${JSON.stringify(schema, null, 2)}\n`;
}

function writeSchemas(): void {
    for (const schema of schemas) {
        const generatedSchema = generateSchema(
            schema.sourcePath,
            schema.sourceType,
        );
        const outputPath = resolve(projectRoot, schema.schemaPath);
        writeFileSync(outputPath, generatedSchema);
    }
}

function checkSchemas(): void {
    for (const schema of schemas) {
        const generatedSchema = generateSchema(
            schema.sourcePath,
            schema.sourceType,
        );
        const existingSchema = readFileSync(
            resolve(projectRoot, schema.schemaPath),
            "utf8",
        );

        if (generatedSchema !== existingSchema) {
            throw new Error(`Schema mismatch: ${schema.schemaPath}`);
        }
    }
}

if (checkMode) {
    checkSchemas();
} else {
    writeSchemas();
}
