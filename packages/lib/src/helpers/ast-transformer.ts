function generateCQLFromData(criteria) {
    let cql = `library Retrieve\nusing FHIR version '4.0.0'\ninclude FHIRHelpers version '4.0.0'\n\ncodesystem loinc: 'http://loinc.org'\n`;
  
    // Define context and attributes
    cql += 'context Patient\n\n';
    for (const criterion of criteria) {
      cql += `define ${criterion.attribute}:\nif (Patient.${criterion.attribute} is null) then 'unknown' else Patient.${criterion.attribute}\n\n`;
    }
  
    // Define InInitialPopulation condition
    cql += 'define InInitialPopulation:\n';
    cql += '(';
  
    const genderCriteria = criteria.find((criterion) => criterion.attribute === 'gender');
    if (genderCriteria) {
      cql += `Patient.${genderCriteria.attribute} in { ${genderCriteria.values.join(', ')} }`;
    }
  
    const diagnosisCriteria = criteria.find((criterion) => criterion.attribute === 'diagnosis');
    if (diagnosisCriteria) {
      if (genderCriteria) cql += ' and ';
  
      if (diagnosisCriteria.codeSystem) {
        cql += '(';
        for (const value of diagnosisCriteria.values) {
          cql += `exists [Condition: Code '${value}' from ${diagnosisCriteria.codeSystem}] or `;
        }
        cql = cql.slice(0, -4); // Remove the trailing " or "
        cql += ')';
      } else {
        cql += `exists [Condition: Code '${diagnosisCriteria.values.join("' or Code '")}' from icd10]`;
      }
    }
  
    cql += ')\n';
  
    return cql;
  }
  
  const criteria = [
    {
      attribute: "gender",
      values: ["male", "female"],
    },
    {
      attribute: "diagnosis",
      values: ["C31", "C41"],
      codeSystem: "icd10",
    },
  ];
  
  const generatedCQL = generateCQLFromData(criteria);
  















export const buildAstFromQuery = (queryStore) => {

      
      function generateCQL(data) {
        let cql = 'library Retrieve\nusing FHIR version \'4.0.0\'\ninclude FHIRHelpers version \'4.0.0\'\n\ncodesystem loinc: \'http://loinc.org\'\ncodesystem icd10: \'http://fhir.de/CodeSystem/bfarm/icd-10-gm\'\n\ncontext Patient\n\n';
      
        for (const item of data) {
          cql += `define ${item.key}:\nif (Patient.${item.key} is null) then 'unknown' else Patient.${item.key}\n\n`;
        }
      
        cql += 'define InInitialPopulation:\n';
      
        for (const item of data) {
          if (item.values.length > 0) {
            const values = item.values.map((value) => `'${value.value}'`).join(', ');
            cql += `(Patient.${item.key} in { ${values} }) or `;
          }
        }
      
        // Remove the trailing "or " from the last condition
        cql = cql.slice(0, -4) + '\n';
      
        return cql;
      }
      
      // const generatedCQL = generateCQL(data);
      
    const ast = {
        key: 'main',
        de: 'haupt',
        en: 'main',
        operand: 'OR', // top layer needs to be 'OR'
        children: [
            // Groups
            {
                key: 'group1', // or 'main'?
                de: 'haupt',//? how is would this be translated to cql when there are more 'main' elements?
                en: 'main',//?
                operand: 'AND',
                children: [
                    // Conditions
                    {
                        /**
                         * does diagnosis have to be an operation with 'OR' operand? 
                        */
                       key: 'diagnosis', // object key
                       operand: 'OR',
                       children: [
                           {
                               "key": "diagnosis",
                               "type": "EQUALS",
                               "system": "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
                               "value": "C32.9"
                            },
                        ]
                    },
                    {
                        /**
                         * Or does it suffice to have a value array with all the value objects?
                         * like this:
                         */
                        key: 'diagnosis', // object key
                        type: 'IN', // would this work with 'IN' if structure is like this?
                        system: '',
                        value: [
                            {
                                "key": "diagnosis",
                                "system": "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
                                "value": "C32.9"
                            },
                        ]
                    },
                ]
            },
            {
                key: 'group2',
                de: 'haupt',
                en: 'main',
                operand: 'AND',
                children: [
                    {
                        key: 'gender', // object key
                        type: 'IN', // does it have to be 'IN', or can it be an array of objects with 'OR' operand?
                        system: '',
                        value: [
                            'female', // object key: value from {name: 'female' value: 'female'}
                        ]
                    },
                    {
                        key: "diagnosis_age_donor",
                        type: 'BETWEEN',
                        system: '',
                       // value: {min: 0, max: 50},  current version can only handle one value, not an array of values?
                        value: [
                            {
                                min: 0,
                                max: 50
                            },
                        ]
                    }
                ]
            },
        ]
    }       

}
 
 
 
 
 
 
 
 const astExample = {
    "operand": "AND",
    "children": [
        {
            "key": "gender",
            "type": "IN",
            "system": "",
            "value": [
                "male",
                "female"
            ]
        },
        {
            "operand": "OR",
            "children": [
                {
                    "key": "diagnosis",
                    "type": "EQUALS",
                    "system": "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
                    "value": "C32.9"
                },
                {
                    "key": "diagnosis",
                    "type": "EQUALS",
                    "system": "http://fhir.de/CodeSystem/dimdi/icd-10-gm",
                    "value": "C51.0"
                }
            ],
            "key": "diagnosis",
            "de": "Diagnose ICD-10",
            "en": "Diagnosis ICD-10"
        },
        {
            "key": "diagnosis_age_donor",
            "type": "LOWER_THAN",
            "system": "",
            "value": {
                "min": 0,
                "max": 50
            }
        }
    ],
    "key": "main",
    "de": "haupt",
    "en": "main"
}