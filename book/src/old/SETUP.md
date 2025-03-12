# Setup

## Project

First setup your project with a framework of your choice (Svelte, React, Vue, Angular,...).

Then run

```
npm install @samply/lens
```

<br>
<br>

[comment]: <> (TODO:)
[comment]: <> (Setup minimal backend)
[comment]: <> (Provide code for a simple apt that takes the AST and returns some mock data as promise)

## Configuration

### Use the Lens Options Component to fill in your configuration

```
<lens-options options={yourlibraryOptions} catalogueData={yourCatalogueData} />
```

- ```options``` takes the general configuration for the library as JSON.
- ```catalogueData``` takes a catalogue of search criteria, also as JSON.

### Schemas

<details>
<summary>options</summary>

```
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Lens Options",
    "description": "The options for the lens",
    "type": "object",
    "properties": {
        "iconOptions": {
            "type": "object",
            "properties": {
                "infoUrl": {
                    "type": "string",
                    "pattern": "^.+$",
                    "description": "The icon to use for the info button"
                },
                "addUrl": {
                    "type": "string",
                    "pattern": "^.+$",
                    "description": "The icon to use for the add button in the catalogue"
                },
                "toggleUrl": {
                    "type": "string",
                    "pattern": "^.+$",
                    "description": "The icon to use for the toggle button in the catalogue"
                }
            },
            "additionalProperties": false,
            "unevaluatedProperties": false,
            "required": []
        },
        "chartOptions": {
            "type": "object",
            "patternProperties": {
                "^.+$": {
                    "type": "object",
                    "properties": {
                        "legendMapping": {
                            "type": "object",
                            "patternProperties": {
                                "^.+$": {
                                    "type": "string",
                                    "pattern": "^.+$"
                                }
                            },
                            "additionalProperties": false,
                            "unevaluatedProperties": false,
                            "required": []
                        },
                        "hintText": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "pattern": "^.+$",
                                "description": "The hint text to display as overlay of the info button"
                            }
                        },
                        "aggregations": {
                            "type": "array",
                            "description": "add strings of other data keys to include in the chart",
                            "items": {
                                "type": "string",
                                "pattern": "^.+$"
                            }
                        },
                        "tooltips": {
                            "type": "object",
                            "patternProperties": {
                                "^.+$": {
                                    "type": "string",
                                    "pattern": "^.+$",
                                    "description": "The tooltip to display while hovering over the chart data"
                                }
                            },
                            "additionalProperties": false,
                            "unevaluatedProperties": false,
                            "required": []
                        }
                    },
                    "additionalProperties": false,
                    "unevaluatedProperties": false,
                    "required": []
                }
            },
            "additionalProperties": false,
            "unevaluatedProperties": false,
            "required": []
        },
        "tableOptions": {
            "type": "object",
            "properties": {
                "headerData": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "description": "the title of the column",
                                "pattern": "^.+$"
                            },
                            "dataKey": {
                                "type": "string",
                                "description": "a single key to display in the table",
                                "pattern": "^.+$"
                            },
                            "aggregatedDataKeys": {
                                "type": "array",
                                "description": "an array of keys to aggregate and display in the table as single value",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "groupCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        },
                                        "stratifierCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        },
                                        "stratumCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        }
                                    },
                                    "additionalProperties": false,
                                    "unevaluatedProperties": false,
                                    "required": []
                                }
                            }
                        },
                        "additionalProperties": false,
                        "unevaluatedProperties": false,
                        "required": [
                            "title"
                        ]
                    }
                }
            },
            "additionalProperties": false,
            "unevaluatedProperties": false,
            "required": ["headerData"]
        },
        "resultSummaryOptions": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "pattern": "^.+$"
                },
                "infoButtonText": {
                    "type": "string",
                    "pattern": "^.+$"
                },
                "dataTypes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "pattern": "^.+$"
                            },
                            "dataKey": {
                                "type": "string",
                                "pattern": "^.+$"
                            },
                            "aggregatedDataKeys": {
                                "type": "array",
                                "description": "an array of keys to aggregate and display in the result summary as single value",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "groupCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        },
                                        "stratifierCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        },
                                        "stratumCode": {
                                            "type": "string",
                                            "pattern": "^.+$"
                                        }
                                    },
                                    "additionalProperties": false,
                                    "unevaluatedProperties": false,
                                    "required": []
                                }
                            }
                        },
                        "additionalProperties": false,
                        "unevaluatedProperties": false,
                        "required": []
                    }
                }
            },
            "additionalProperties": false,
            "unevaluatedProperties": false,
            "required": []
        }
    },
    "additionalProperties": false,
    "unevaluatedProperties": false,
    "required": []
}
```
</details>

<details>
<summary>catalogueData</summary>

```
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "title": "Search Parameter Catalogue",
    "description": "A catalogue of search parameters",
    "type": "array",
    "items": {
        "$ref": "#/$defs/categoryItem"
    },
    "$defs": {
        "childCategories": {
            "type": "array",
            "items": {
                "$ref": "#/$defs/categoryItem"
            }
        },
        "categoryItem": {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "pattern": "^.+$"
                },
                "name": {
                    "type": "string",
                    "pattern": "^.+$"
                },
                "subCategoryName": {
                    "type": "string",
                    "pattern": "^.+$"
                },
                "infoButtonText": {
                    "type": "array",
                    "description": "The text to display in the info button",
                    "items": {
                        "type": "string",
                        "pattern": "^.*$"
                    }
                },
                "system": {
                    "type": "string",
                    "pattern": "^.*$"
                },
                "fieldType": {
                    "enum": [
                        "single-select",
                        "number",
                        "autocomplete"
                    ]
                },
                "type": {
                    "enum": [
                        "EQUALS",
                        "BETWEEN"
                    ]
                },
                "childCategories": {
                    "$ref": "#/$defs/childCategories"
                },
                "criteria": {
                    "$ref": "#/$defs/criteria"
                }
            },
            "additionalProperties": false,
            "unevaluatedProperties": false,
            "required": [
                "key",
                "name"
            ]
        },
        "criteria": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "key": {
                        "type": "string",
                        "pattern": "^.+$"
                    },
                    "name": {
                        "type": "string",
                        "pattern": "^.+$"
                    },
                    "description": {
                        "type": "string",
                        "pattern": "^.*$"
                    },
                    "infoButtonText": {
                        "type": "array",
                        "description": "The text to display in the info button",
                        "items": {
                            "type": "string",
                            "pattern": "^.+$"
                        }
                    },
                    "aggregatedValue": {
                        "type": "array",
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "value": {
                                        "type": "string",
                                        "pattern": "^.+$"
                                    },
                                    "name": {
                                        "type": "string",
                                        "pattern": "^.+$"
                                    }
                                },
                                "additionalProperties": false,
                                "unevaluatedProperties": false,
                                "required": [
                                    "value",
                                    "name"
                                ]
                            }
                        }
                    }
                },
                "additionalProperties": false,
                "unevaluatedProperties": false,
                "required": [
                    "key",
                    "name"
                ]
            }
        }
    }
}
```
</details>

<br>
<br>

## How to use Lens components

Here we use a minimal setup with a search tree, an autocomplete search bar, the search button and a simple chart

Place the following components in your application where they are needed.

### Catalogue

```
<lens-catalogue />
```

displays a catalogue navigation


### Search Bar

```
<lens-search-bar noMatchesFoundMessage={"No matches found"} />
```

### Search Button

```
<lens-search-button title="Search" />
```

### Bar Chart

```
<lens-chart
    title="Alter bei Erstdiagnose"
    catalogueGroupCode="age_at_diagnosis"
    chartType="bar"
/>
```

- ```title```: the title to show as heading in the chart
- ```atalogueGroupCode```: the key of your childCategory in the catalogue
- ```chartType```: the type of the chart (currently supports: ```bar``` for bar charts and ```pie``` for pie charts

[comment]:<> (TODO: Add full documentation website)

[comment]:<> (There are multiple other configurations you can pass into these components, like coloring and orientation for the chart. Visit the full [documentation]link for more information.)

<br>
<br>

## Styling the components

The library provides a default styling.

You can import it in your main css file like this:

```
@import "<path-to>/node_modules/@samply/lens/dist/style.css";
```

However you can override these styles using css (or your favorite preprocessor) with the web component syntax.

```
lens-catalogue::part(number-input-formfield) {
  width: 60px;
  margin-left: 20px;
  border: solid 1px dark-gray;
  border-radius: 0;
  text-align: center;
  font-size: 14px;
}
```

The styling with parts is scoped to the lens-component and does not affect other components.
You can also use pseudo classes like this:

```
lens-catalogue::part(number-input-formfield):focus {
  border-color: blue;
  outline: none;
}
```

Make sure to add your custom styles after the import.