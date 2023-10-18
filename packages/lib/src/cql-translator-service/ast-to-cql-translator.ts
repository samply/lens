/**
 * TODO: Document this file.
 */



import type { AstBottomLayerValue, AstElement, AstTopLayer } from "../types/ast";
import { alias as aliasMap, cqltemplate, criterionMap } from "./cqlquery-mappings";
import { getCriteria } from "../stores/catalogue";
import type { Measure } from '../types/backend';
import { measureStore } from '../stores/measures';

/**
 * Get all cql from the project specific measures from the store
 */
let measuresCql: string[] = []

measureStore.subscribe((measures: Measure[]) => {
  measuresCql = measures.map(measure => measure.cql)
})


let codesystems: string[] = []
let criteria: string[]



export const translateAstToCql = (query: AstTopLayer, returnOnlySingeltons: boolean = true, backendMeasureReplacement: boolean = false): string => {
  criteria = getCriteria("diagnosis")

  /**
   * DISCUSS: why is this even an array?
   * in bbmri there is only concatted to the string
   */
  codesystems = [
    // NOTE: We always need loinc, as the Deceased Stratifier is computed with it!!!
    "codesystem loinc: 'http://loinc.org'"
  ]

  const cqlHeader = "library Retrieve\n" +
    "using FHIR version '4.0.0'\n" +
    "include FHIRHelpers version '4.0.0'\n" +
    "\n"

  let singletons: string = "";
  singletons = (backendMeasureReplacement)
    ? "DKTK_STRAT_DEF_IN_INITIAL_POPULATION\n"
    : "define InInitialPopulation:\n"
  singletons += resolveOperation(query)

  if (query.children.length == 0) {
    singletons += "true"
  }

  if (returnOnlySingeltons) {
    return singletons
  }

  return cqlHeader +
    getCodesystems() +
    "context Patient\n" +
    measuresCql.join('') +
    singletons
}

const resolveOperation = (operation: AstElement): string => {

  let expression: string = "";

  if ('children' in operation && operation.children.length > 1) {
    expression += "("
  }

  'children' in operation && operation.children.forEach((element: AstElement, index) => {
    if ('children' in element) {
      expression += resolveOperation(element)
    }
    if ('key' in element && 'type' in element && 'system' in element && 'value' in element) {
      expression += getSingleton(element)
    }
    if (index < operation.children.length - 1) {
      expression += ")" + ` ${operation.operand.toLowerCase()} ` + "\n("
    } else {
      if (operation.children.length > 1) { expression += ")" }
    }
  })

  return expression
}


const getSingleton = (criterion: AstBottomLayerValue): string => {
  let expression: string = "";

  //TODO: Workaround for using the value of "Therapy of Tumor" as key. Need an additional field in catalogue
  if (criterion.key === "therapy_of_tumor") {
    criterion.key = criterion.value as string;
  }

  const myCriterion = criterionMap.get(criterion.key)

  if (myCriterion) {
    const myCQL = cqltemplate.get(myCriterion.type)
    if (myCQL) {
      switch (myCriterion.type) {
        case "gender":
        case "conditionValue":
        case "conditionBodySite":
        case "conditionLocalization":
        case "observation":
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
        case "department":
        case "TNM-x": {
          if (typeof criterion.value === "string") {
            // TODO: Check if we really need to do this or we can somehow tell cql to do that expansion it self
            if (criterion.value.slice(-1) === "%") {
              const mykey = criterion.value.slice(0, -2)
              if (criteria != undefined) {
                let expandedValues = criteria
                  .filter(value => value.startsWith(mykey))
                expression += getSingleton(
                  {
                    key: criterion.key,
                    type: criterion.type,
                    system: criterion.system,
                    value: expandedValues,
                  }
                )
              }
            } else {
              expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value as string)
            }
          }
          if (typeof criterion.value === "boolean") {
            expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL)
          }


          if (criterion.value instanceof Array) {
            if (criterion.value.length === 1) {
              expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value[0])
            } else {
              criterion.value.forEach((value: string) => {
                expression += "(" + substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, value) + ") or\n"
              })
              expression = expression.slice(0, -4)
            }
          }


          break
        }

        case "conditionRangeDate":
        case "conditionRangeAge": {
          if (typeof criterion.value == "object"
            && !(criterion.value instanceof Array)) {
            expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, "", criterion.value.min as number, criterion.value.max as number)
          }
          break
        }
      }
    }
  }
  return expression
}







const substituteCQLExpression = (key: string, alias: string[] | undefined, cql: string, value?: string, min?: number, max?: number): string => {
  let cqlString: string
  if (value) {
    cqlString = cql.replace(new RegExp("{{C}}"), value)
  } else {
    cqlString = cql
  }
  cqlString = cqlString.replace(new RegExp("{{K}}"), key)
  if (alias && alias[0]) {
    cqlString = cqlString.replace(new RegExp("{{A1}}", "g"), alias[0])
    const systemExpression = "codesystem " + alias[0] + ": '" + aliasMap.get(alias[0]) + "'"
    if (!codesystems.includes(systemExpression)) { codesystems.push(systemExpression) }
  }
  if (alias && alias[1]) {
    cqlString = cqlString.replace(new RegExp("{{A2}}", "g"), alias[1])
    const systemExpression = "codesystem " + alias[1] + ": '" + aliasMap.get(alias[1]) + "'"
    if (!codesystems.includes(systemExpression)) { codesystems.push(systemExpression) }
  }
  if (min || min === 0) {
    cqlString = cqlString.replace(new RegExp("{{D1}}"), min.toString())
  }
  if (max || max === 0) {
    cqlString = cqlString.replace(new RegExp("{{D2}}"), max.toString())
  }
  return cqlString
}




const getCodesystems = (): string => {
  let codesystemString: string = ""

  codesystems.forEach((systems) => {
    codesystemString += systems + "\n"
  })

  if (codesystems.length > 0) {
    codesystemString += "\n"
  }

  return codesystemString
}
