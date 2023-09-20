import { criterionMap, cqltemplate, alias } from "./cql-maps"


let criteria

let codesystems: string[] = []

export const transform = (query): string => {
  criteria = catalogueService.getCriteria("diagnosis")
  codesystems = [
    // NOTE: We always need loinc, as the Deceased Stratifier is computed with it!!!
    "codesystem loinc: 'http://loinc.org'"
  ]
  const cqlHeader = "library Retrieve\n" +
    "using FHIR version '4.0.0'\n" +
    "include FHIRHelpers version '4.0.0'\n" +
    "\n"

  let singletons: string = "define InInitialPopulation:\n"
  query.children.forEach((criterion) => {
    singletons += getSingleton(criterion)
  })
  console.log('singletons', singletons)

  if(query.children.length == 0) {
    singletons += "true"
  } else {
    singletons = singletons.slice(0, -5)
  }

  return cqlHeader +
    getCodesystems() +
    "context Patient\n" +
    configuration.resultRequests.map(request => request.cql).join("") +
    singletons
}

export const getSingleton = (criterion): string => {
  let expression: string = ""
  if (criterion instanceof Condition) {
    const myCriterion = criterionMap.get(criterion.key)
    if (myCriterion) {
      const myCQL = cqltemplate.get(myCriterion.type)
      if (myCQL) {
        expression += '('
        switch (myCriterion.type) {

          case "gender": {
            expression += myCQL
            if(criterion.value instanceof Array<string>) {
              if (criterion.value.length === 1) {
                expression += " = '" + criterion.value[0] + "') and\n"
              } else {
                expression += " in { "
                criterion.value.forEach((value: string) => {
                  expression += "'" + value + "', "
                })
                expression = expression.slice(0, -2) + " }) and\n"
              }
            }
            break
          }

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
              // TODO: Check if we really need to do or we can somehow tell cql to do that expansion it self
              if (criterion.value.slice(-1) === "%") {
                const mykey = criterion.value.slice(0, -2)
                if (criteria.values != undefined) {
                  let expandedValues = criteria.values
                    .filter(value => value.key.indexOf(mykey) != -1)
                    .map(value => value.key)
                  expression += getSingleton(
                    new Condition(
                      criterion.key,
                      criterion.type,
                      criterion.system,
                      expandedValues,
                    )
                  ).substring(1)
                }
              } else {
                expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value as string) + ") and\n"
              }
            }
            if (typeof criterion.value === "boolean") {
              expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL) + ") and\n"
            }
            if (criterion.value instanceof Array<string>) {
              if (criterion.value.length === 1) {
                expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, criterion.value[0]) + ") and\n"
              } else {
                criterion.value.forEach((value: string) => {
                  expression += "(" + substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, value) + ") or\n"
                })
                expression = expression.slice(0, -4) + ") and\n"
              }
            }
            break
          }

          case "conditionRangeDate":
          case "conditionRangeAge": {
            if (typeof criterion.value == "object"
              && !(criterion.value instanceof Array<string>)) {
              expression += substituteCQLExpression(criterion.key, myCriterion.alias, myCQL, "", criterion.value.min as number, criterion.value.max as number) + ") and\n"
            }
            break
          }
        }
      }
    }
  }
  if (criterion instanceof Operation) {
    if (criterion.children.length > 1) {expression += '('}
    criterion.children.forEach((criterionEntity) => {
      if (criterionEntity.isEmpty()) {
        // needs to be catched, because we currently don't block invalid queries
        console.warn(`Detected empty criterion entity ${criterionEntity.key}`)
      } else if (criterionEntity instanceof Operation) {
        expression += '('
        if (criterionEntity.children[0] instanceof Condition) {
          expression += getSingleton(criterionEntity.children[0])
        }
        if (criterionEntity.children[0] instanceof Operation) {
          expression += '('
          criterionEntity.children[0].children.forEach((criterionEntityInner) => {
            expression += getSingleton(criterionEntityInner)
            expression = expression.slice(0, -4) + "or\n"
          })
          expression = expression.slice(0, -4) + ") and\n"
        }
        if (criterionEntity.children[1] instanceof Condition) {
          expression += getSingleton(criterionEntity.children[1])
        }
        if (criterionEntity.children[1] instanceof Operation) {
          expression += '('
          criterionEntity.children[1].children.forEach((criterionEntityInner) => {
            expression += getSingleton(criterionEntityInner)
            expression = expression.slice(0, -4) + "or\n"
          })
          expression = expression.slice(0, -4) + ") and\n"
        }
        expression = expression.slice(0, -5) + ") or\n"
      } else {
        expression += getSingleton(criterionEntity).slice(0,-5) + ` ${criterion.operand.toLowerCase()} `
      }
    })
    if (criterion.children.length > 1) {
      expression = expression.slice(0, -4) + ") and\n"
    } else {
      expression = expression.slice(0, -4) + " and\n"
    }
  }
  return expression
}



export const substituteCQLExpression = (key: string, alias:string[] | undefined, cql: string, value?: string, min?: number, max?: number): string => {
  let cqlString: string
  if (value) {
    cqlString = cql.replace(new RegExp("{{C}}"), value)
  } else {
    cqlString = cql
  }
  cqlString = cqlString.replace(new RegExp("{{K}}"), key)
  if (alias && alias[0]) {
    cqlString = cqlString.replace(new RegExp("{{A1}}", "g"), alias[0])
    const systemExpression = "codesystem " + alias[0] + ": '" + alias.get(alias[0]) + "'"
    if (!codesystems.includes(systemExpression)) {codesystems.push(systemExpression)}
  }
  if (alias && alias[1]) {
    cqlString = cqlString.replace(new RegExp("{{A2}}", "g"), alias[1])
    const systemExpression = "codesystem " + alias[1] + ": '" + alias.get(alias[1]) + "'"
    if (!codesystems.includes(systemExpression)) {codesystems.push(systemExpression)}
  }
  if (min) {
    cqlString = cqlString.replace(new RegExp("{{D1}}"), min.toString())
  }
  if (max) {
    cqlString = cqlString.replace(new RegExp("{{D2}}"), max.toString())
  }
  return cqlString
}



export const getCodesystems = (): string => {
  let newCodesystems: string = ""
  codesystems.forEach((systems) => {
    newCodesystems += systems + "\n"
  })
  if (codesystems.length > 0) {
    newCodesystems += "\n"
  }
  return newCodesystems
}

