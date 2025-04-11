/**
 * TODO: Document this file. Move to Project
 */

import {
    type AstBottomLayerValue,
    type AstElement,
    type AstTopLayer,
    isBottomLayer,
    isTopLayer,
} from "../types/ast";
import {
    alias as aliasMap,
    cqltemplate,
    criterionMap,
} from "./cqlquery-mappings";
import { resolveAstSubCatagories } from "../stores/catalogue";
import type { MeasureItem } from "../types/backend";

const codesystems: string[] = [
    "codesystem loinc: 'http://loinc.org'",
    "codesystem icd10: 'http://fhir.de/CodeSystem/bfarm/icd-10-gm'",
    "codesystem verlauftumorstatuslymphknotencs: 'http://dktk.dkfz.de/fhir/onco/core/CodeSystem/VerlaufTumorstatusLymphknotenCS'",
    "codesystem morph: 'urn:oid:2.16.840.1.113883.6.43.1'",
    "codesystem Therapieart: 'http://dktk.dkfz.de/fhir/onco/core/CodeSystem/SYSTTherapieartCS'",
    "codesystem atc: 'http://fhir.de/CodeSystem/bfarm/atc'",
];

export const translateAstToCql = (
    query: AstTopLayer,
    returnOnlySingeltons: boolean = true,
    backendMeasures: string,
    measures: MeasureItem[],
): string => {
    const localMeasures: { key: string; cql: string }[] = [];
    measures.forEach((x) => {
        localMeasures.push({
            key: x.key,
            cql: x.cql,
        });
    });

    const cqlHeader =
        "library Retrieve\n" +
        "using FHIR version '4.0.0'\n" +
        "include FHIRHelpers version '4.0.0'\n" +
        "\n";

    let singletons: string = "";
    singletons = backendMeasures;

    query = resolveAstSubCatagories(query);

    singletons += resolveOperation(query);

    let retrievalCriteria: string = "if InInitialPopulation then ";

    const additionalCriteria = processAdditionalCriterion(query);
    if (
        additionalCriteria == "" ||
        additionalCriteria.substring(additionalCriteria.length - 1) == "("
    ) {
        retrievalCriteria += "[Specimen]";
    } else if (
        additionalCriteria.substring(additionalCriteria.length - 9) ==
        "intersect"
    ) {
        retrievalCriteria += "[Specimen] S where " + additionalCriteria;
        retrievalCriteria = retrievalCriteria.slice(0, -10);
    } else {
        retrievalCriteria += "[Specimen] S where " + additionalCriteria;
        retrievalCriteria = retrievalCriteria.slice(0, -4);
    }

    retrievalCriteria = retrievalCriteria += " else {} as List<Specimen>";
    const specimenMeasure = localMeasures.find(
        (element) => element.key == "specimen",
    );
    if (specimenMeasure?.key) {
        specimenMeasure.cql = specimenMeasure.cql + retrievalCriteria;
    }

    const histoMeasure = localMeasures.find(
        (element) => element.key == "Histo",
    );
    if (histoMeasure?.cql) {
        if (
            !additionalCriteria.includes("type") ||
            additionalCriteria.includes("tumor-tissue-ffpe")
        ) {
            histoMeasure.cql =
                histoMeasure.cql +
                " if histo.code.coding.where(code = '59847-4').code.first() is null then 0 else 1\n";
        } else {
            histoMeasure.cql =
                histoMeasure.cql +
                " if histo.code.coding.where(code = '59847-4').code.first() is null then 0 else 0\n";
        }
    }

    if (isQueryEmpty(query)) {
        singletons += "\ntrue";
    }

    if (returnOnlySingeltons) {
        return singletons;
    }

    console.log(singletons);

    const cqlquery =
        cqlHeader +
        getCodesystems() +
        "context Patient\n" +
        localMeasures.map((measureItem) => measureItem.cql).join("") +
        `DKTK_STRAT_DEF_IN_INITIAL_POPULATION 
        (
        ( exists [Condition: Code 'C34.0' from icd10]
        or exists [Condition: Code 'C34.1' from icd10]
        or exists [Condition: Code 'C34.2' from icd10]
        or exists [Condition: Code 'C34.3' from icd10]
        or exists [Condition: Code 'C34.8' from icd10]
        or exists [Condition: Code 'C34.9' from icd10]
        )       and ( exists from
          [Observation: Code '59847-4' from loinc] O
          where O.value.coding.code in { '8030/3', '8141/3', '8143/3', '8147/3', '8250/3', '8251/3', '8252/3', '8253/3', '8255/3', '8260/3', '8310/3', '8333/3', '8470/3', '8480/3', '8490/3', '8550/3', '8052/3', '8070/3', '8071/3', '8072/3', '8073/3', '8083/3', '8560/3', '8012/3', '8014/3', '8046/3', '8022/3', '8031/3', '8032/3', '8972/3', '8973/3', '8980/3', '8200/3', '8430/3', '8562/3', '8940/3', '8010/3', '8082/3', '8123/3', '8230/3', '8244/3', '8254/3', '8323/3', '8140/3' }
      )
    )
    and ( exists ( [MedicationStatement] MS
            where MS.medication.text.matches ( '(?i).*osimertinib.*' ))
          or exists ( [MedicationStatement] MS
              where MS.medication.text.matches ( '(?i).*gefitinib.*' ))
          or exists ( [MedicationStatement] MS
              where MS.medication.text.matches ( '(?i).*erlotinib.*' ))
          or exists ( [MedicationStatement] MS
              where MS.extension.where ( url = 'http://dktk.dkfz.de/fhir/StructureDefinition/onco-core-Extension-SystemischeTherapieProtokoll' ).value.text.matches ( '(?i).*osimertinib.*' ))
          or exists ( [MedicationStatement] MS
              where MS.extension.where ( url = 'http://dktk.dkfz.de/fhir/StructureDefinition/onco-core-Extension-SystemischeTherapieProtokoll' ).value.text.matches ( '(?i).*gefitinib.*' ))
          or exists ( [MedicationStatement] MS
              where MS.extension.where ( url = 'http://dktk.dkfz.de/fhir/StructureDefinition/onco-core-Extension-SystemischeTherapieProtokoll' ).value.text.matches ( '(?i).*erlotinib.*' ))
          or exists ( [MedicationStatement] MS
                where exists ( MS.medication.coding C
                    where C.system = 'http://fhir.de/CodeSystem/bfarm/atc'
                      and C.code in { 'L01EB01', 'L01EB02', 'L01EB04' }
                      ))
                      )
and (
        exists (
  from [Procedure: category in Code 'ST' from Therapieart] ST
  where exists(ST.extension EX
    where EX.url = 'http://dktk.dkfz.de/fhir/StructureDefinition/onco-core-Extension-Bestrahlung'
    and exists (EX.extension EX2
      where EX2.url = 'Gesamtdosis'
      and EX2.value.as(Quantity).value in {60.0, 66.0, 45.0, 46.0}
    )
  )
)
    )

        `;

    console.log(cqlquery);

    return cqlquery;
};

const isQueryEmptyRec = (query: AstElement): boolean => {
    if (isBottomLayer(query)) {
        return false;
    }
    if (query.children.length === 0) {
        return true;
    }
    return query.children.every(isQueryEmptyRec);
};

const isQueryEmpty = (query: AstTopLayer): boolean => {
    if (query.children.length === 0) {
        return true;
    }
    return query.children.every(isQueryEmptyRec);
};

const processAdditionalCriterion = (query: AstElement): string => {
    let additionalCriteria = "";

    if (isTopLayer(query)) {
        const top: AstTopLayer = query;
        top.children.forEach(function (child) {
            additionalCriteria += processAdditionalCriterion(child);
        });
    } else {
        const buttom: AstBottomLayerValue = query;
        additionalCriteria += getRetrievalCriterion(buttom);
    }
    return additionalCriteria;
};

const getRetrievalCriterion = (criterion: AstBottomLayerValue): string => {
    let expression: string = "";
    let myCQL: string = "";
    const myCriterion = criterionMap.get(criterion.key);
    if (myCriterion) {
        switch (myCriterion.type) {
            case "specimen": {
                expression += "(";
                myCQL += cqltemplate.get("retrieveSpecimenByType");
                if (typeof criterion.value === "string") {
                    expression +=
                        substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL,
                            criterion.value as string,
                        ) + ") or\n";
                }
                if (Array.isArray(criterion.value)) {
                    const values: string[] = [];
                    criterion.value.forEach((element) => {
                        values.push(element);
                    });

                    if (criterion.value.includes("blood-plasma")) {
                        values.push(
                            "plasma-edta",
                            "plasma-citrat",
                            "plasma-heparin",
                            "plasma-cell-free",
                            "plasma-other",
                            "plasma",
                        );
                    }
                    if (criterion.value.includes("blood-serum")) {
                        values.push("serum");
                    }
                    if (criterion.value.includes("tumor-tissue-ffpe")) {
                        values.push(
                            "tissue-ffpe",
                            "tumor-tissue-ffpe",
                            "normal-tissue-ffpe",
                            "other-tissue-ffpe",
                            "tissue-formalin",
                        );
                    }
                    if (criterion.value.includes("tissue-frozen")) {
                        values.push(
                            "tumor-tissue-frozen",
                            "tissue-frozen",
                            "normal-tissue-frozen",
                            "other-tissue-frozen",
                        );
                    }
                    if (criterion.value.includes("dna")) {
                        values.push("cf-dna", "g-dna");
                    }
                    if (criterion.value.includes("tissue-other")) {
                        values.push("tissue-paxgene-or-else", "tissue");
                    }
                    if (criterion.value.includes("derivative-other")) {
                        values.push("derivative");
                    }
                    if (criterion.value.includes("liquid-other")) {
                        values.push("liquid");
                    }

                    if (values.length === 1) {
                        expression +=
                            substituteCQLExpression(
                                criterion.key,
                                myCriterion.alias,
                                myCQL,
                                values[0],
                            ) + ") and\n";
                    } else {
                        values.forEach((value: string) => {
                            expression +=
                                "(" +
                                substituteCQLExpression(
                                    criterion.key,
                                    myCriterion.alias,
                                    myCQL,
                                    value,
                                ) +
                                ") or\n";
                        });
                        expression = expression.slice(0, -4) + ") or\n";
                    }
                }
                break;
            }
        }
    }
    return expression;
};

const resolveOperation = (operation: AstElement): string => {
    let expression: string = "";

    if ("children" in operation && operation.children.length > 1) {
        expression += "(";
    }

    "children" in operation &&
        operation.children.forEach((element: AstElement, index) => {
            if (element === null) return;
            if ("children" in element) {
                expression += resolveOperation(element);
            }
            if (
                "key" in element &&
                "type" in element &&
                "system" in element &&
                "value" in element
            ) {
                expression += getSingleton(element);
            }
            if (index < operation.children.length - 1) {
                expression +=
                    ")" + ` ${operation.operand.toLowerCase()} ` + "\n(";
            } else {
                if (operation.children.length > 1) {
                    expression += ")";
                }
            }
        });

    return expression;
};

const getSingleton = (criterion: AstBottomLayerValue): string => {
    let expression: string = "";

    //TODO: Workaround for using the value of "Therapy of Tumor" as key. Need an additional field in catalogue
    if (criterion.key === "therapy_of_tumor") {
        criterion.key = criterion.value as string;
    }

    const myCriterion = criterionMap.get(criterion.key);

    if (myCriterion) {
        const myCQL = cqltemplate.get(myCriterion.type);
        if (myCQL) {
            switch (myCriterion.type) {
                case "gender":
                case "pseudo_projects":
                case "histology":
                case "conditionValue":
                case "conditionBodySite":
                case "conditionLocalization":
                case "observation":
                case "uiccstadium":
                case "observationMetastasis":
                case "observationMetastasisBodySite":
                case "procedure":
                case "procedureResidualstatus":
                case "medicationStatement":
                case "specimen":
                case "hasSpecimen":
                case "Organization":
                case "observationMolecularMarkerName":
                case "observationMolecularMarkerAminoacidchange":
                case "observationMolecularMarkerDNAchange":
                case "observationMolecularMarkerSeqRefNCBI":
                case "observationMolecularMarkerEnsemblID":
                case "department": {
                    if (typeof criterion.value === "string") {
                        expression += substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL,
                            criterion.value as string,
                        );
                    }
                    if (typeof criterion.value === "boolean") {
                        expression += substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL,
                        );
                    }

                    if (criterion.value instanceof Array) {
                        if (criterion.value.length === 1) {
                            expression += substituteCQLExpression(
                                criterion.key,
                                myCriterion.alias,
                                myCQL,
                                criterion.value[0],
                            );
                        } else {
                            criterion.value.forEach((value: string) => {
                                expression +=
                                    "(" +
                                    substituteCQLExpression(
                                        criterion.key,
                                        myCriterion.alias,
                                        myCQL,
                                        value,
                                    ) +
                                    ") or\n";
                            });
                            expression = expression.slice(0, -4);
                        }
                    }

                    break;
                }
                case "TNMp":
                case "TNMc": {
                    if (typeof criterion.value === "string") {
                        expression += "(";

                        expression += substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL,
                            criterion.value as string,
                        );
                        expression += ") or (";

                        const myCQL2: string = cqltemplate.get(
                            myCriterion.type == "TNMc" ? "TNMp" : "TNMc",
                        )!;

                        expression += substituteCQLExpression(
                            criterion.key,
                            myCriterion.alias,
                            myCQL2,
                            criterion.value as string,
                        );
                        expression += ")";
                    }
                    break;
                }
                case "conditionRangeDate": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "condition",
                        "Date",
                        myCQL,
                    );
                    break;
                }

                case "primaryConditionRangeDate": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "primaryCondition",
                        "Date",
                        myCQL,
                    );
                    break;
                }

                case "conditionRangeAge": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "condition",
                        "Age",
                        myCQL,
                    );
                    break;
                }

                case "primaryConditionRangeAge": {
                    expression += substituteRangeCQLExpression(
                        criterion,
                        myCriterion,
                        "primaryCondition",
                        "Age",
                        myCQL,
                    );
                    break;
                }
            }
        }
    }
    return expression;
};

const substituteRangeCQLExpression = (
    criterion: AstBottomLayerValue,
    myCriterion: { type: string; alias?: string[] },
    criterionPrefix: string,
    criterionSuffix: string,
    rangeCQL: string,
): string => {
    const input = criterion.value as { min: number; max: number };
    if (input === null) {
        console.warn(
            `Throwing away a ${criterionPrefix}Range${criterionSuffix} criterion, as it is not of type {min: number, max: number}!`,
        );
        return "";
    }
    if (input.min === 0 && input.max === 0) {
        console.warn(
            `Throwing away a ${criterionPrefix}Range${criterionSuffix} criterion, as both dates are undefined!`,
        );
        return "";
    } else if (input.min === 0) {
        const lowerThanDateTemplate = cqltemplate.get(
            `${criterionPrefix}LowerThan${criterionSuffix}`,
        );
        if (lowerThanDateTemplate)
            return substituteCQLExpression(
                criterion.key,
                myCriterion.alias,
                lowerThanDateTemplate,
                "",
                input.min,
                input.max,
            );
    } else if (input.max === 0) {
        const greaterThanDateTemplate = cqltemplate.get(
            `${criterionPrefix}GreaterThan${criterionSuffix}`,
        );
        if (greaterThanDateTemplate)
            return substituteCQLExpression(
                criterion.key,
                myCriterion.alias,
                greaterThanDateTemplate,
                "",
                input.min,
                input.max,
            );
    } else {
        return substituteCQLExpression(
            criterion.key,
            myCriterion.alias,
            rangeCQL,
            "",
            input.min,
            input.max,
        );
    }
    return "";
};

const substituteCQLExpression = (
    key: string,
    alias: string[] | undefined,
    cql: string,
    value?: string,
    min?: number,
    max?: number,
): string => {
    let cqlString: string;
    if (value) {
        cqlString = cql.replace(/{{C}}/g, value);
    } else {
        cqlString = cql;
    }
    cqlString = cqlString.replace(new RegExp("{{K}}"), key);
    if (alias && alias[0]) {
        cqlString = cqlString.replace(new RegExp("{{A1}}", "g"), alias[0]);
        const systemExpression =
            "codesystem " + alias[0] + ": '" + aliasMap.get(alias[0]) + "'";
        if (!codesystems.includes(systemExpression)) {
            codesystems.push(systemExpression);
        }
    }
    if (alias && alias[1]) {
        cqlString = cqlString.replace(new RegExp("{{A2}}", "g"), alias[1]);
        const systemExpression =
            "codesystem " + alias[1] + ": '" + aliasMap.get(alias[1]) + "'";
        if (!codesystems.includes(systemExpression)) {
            codesystems.push(systemExpression);
        }
    }
    if (min || min === 0) {
        cqlString = cqlString.replace(new RegExp("{{D1}}"), min.toString());
    }
    if (max || max === 0) {
        cqlString = cqlString.replace(new RegExp("{{D2}}"), max.toString());
    }
    return cqlString;
};

const getCodesystems = (): string => {
    let codesystemString: string = "";

    codesystems.forEach((systems) => {
        codesystemString += systems + "\n";
    });

    if (codesystems.length > 0) {
        codesystemString += "\n";
    }

    return codesystemString;
};
