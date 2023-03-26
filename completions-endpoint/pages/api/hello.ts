import type {NextApiRequest, NextApiResponse} from 'next'
import {Configuration, OpenAIApi} from "openai"
import {getContributorData} from "@/pages/api/openSecrets";
import {getLatestCovidData} from "@/pages/api/covid";

const DATA = [
  { "id": 0, "name": "John Smith", "age": 35, "skills": [
      {"name": "JavaScript", "rating": 4},
      {"name": "React", "rating": 5},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": null
  },
  { "id": 1, "name": "Jane Doe", "age": 30, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Django", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 0
  },
  { "id": 2, "name": "David Lee", "age": 28, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Flask", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 1
  },
  { "id": 3, "name": "Sophie Johnson", "age": 31, "skills": [
      {"name": "JavaScript", "rating": 5},
      {"name": "React", "rating": 4},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": 1
  },
  { "id": 4, "name": "Ruby Smith", "age": 35, "skills": [
      {"name": "Ruby", "rating": 4},
      {"name": "Rails", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 2
  },
  { "id": 5, "name": "Mia Lee", "age": 27, "skills": [
      {"name": "Java", "rating": 4},
      {"name": "Spring", "rating": 5},
      {"name": "MySQL", "rating": 3}
    ],
    "managerId": 2
  },
  { "id": 6, "name": "Owen Chen", "age": 29, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Django", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 3
  },
  { "id": 7, "name": "Hannah Johnson", "age": 32, "skills": [
      {"name": "JavaScript", "rating": 5},
      {"name": "React", "rating": 4},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": 3
  },
  { "id": 8, "name": "Evelyn Kim", "age": 37, "skills": [
      {"name": "Java", "rating": 4},
      {"name": "Spring", "rating": 5},
      {"name": "Oracle", "rating": 3}
    ],
    "managerId": 4
  },
  { "id": 9, "name": "Dylan Chen", "age": 30, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Django", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 4
  },
  { "id": 10, "name": "Olivia Davis", "age": 34, "skills": [
      {"name": "JavaScript", "rating": 5},
      {"name": "Angular", "rating": 4},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": 5
  },
  { "id": 11, "name": "William Kim", "age": 27, "skills": [
      {"name": "Java", "rating": 4},
      {"name": "Spring Boot", "rating": 5},
      {"name": "MongoDB", "rating": 3}
    ],
    "managerId": 5
  },
  { "id": 12, "name": "Ella Lee", "age": 28, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Flask", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 6
  },
  { "id": 13, "name": "Samuel Johnson", "age": 31, "skills": [
      {"name": "JavaScript", "rating": 5},
      {"name": "React", "rating": 4},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": 6
  },
  { "id": 14, "name": "Nora Kim", "age": 35, "skills": [
      {"name": "Ruby", "rating": 4},
      {"name": "Rails", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 7
  },
  { "id": 15, "name": "Jacob Lee", "age": 27, "skills": [
      {"name": "Java", "rating": 4},
      {"name": "Spring", "rating": 5},
      {"name": "MySQL", "rating": 3}
    ],
    "managerId": 7
  },
  { "id": 16, "name": "Lila Chen", "age": 29, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Django", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 8
  },
  { "id": 17, "name": "Daniel Johnson", "age": 32, "skills": [
      {"name": "JavaScript", "rating": 5},
      {"name": "React", "rating": 4},
      {"name": "Node.js", "rating": 3}
    ],
    "managerId": 8
  },
  { "id": 18, "name": "Aiden Kim", "age": 37, "skills": [
      {"name": "Java", "rating": 4},
      {"name": "Spring", "rating": 5},
      {"name": "Oracle", "rating": 3}
    ],
    "managerId": 9
  },
  { "id": 19, "name": "Lila Davis", "age": 30, "skills": [
      {"name": "Python", "rating": 4},
      {"name": "Django", "rating": 5},
      {"name": "PostgreSQL", "rating": 3}
    ],
    "managerId": 9
  }
];


type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

function inferType(value: JSONValue): string {
  if (typeof value === "string") {
    return "string";
  } else if (typeof value === "number") {
    return "number";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (value === null) {
    return "null";
  } else if (Array.isArray(value)) {
    return "array";
  } else {
    return "object";
  }
}

function isSameJSONValue(a: JSONValue, b: JSONValue): boolean {
  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!isSameJSONValue(a[i], b[i])) {
        return false;
      }
    }
    return true;
  } else if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      // @ts-ignore
      if (!b.hasOwnProperty(key) || !isSameJSONValue(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } else {
    return a === b;
  }
}

function allItemsSameType(array: JSONArray): boolean {
  if (array.length === 0) {
    return true;
  }

  const firstItemTypes = inferJSONStructureTypes(array[0]);
  for (const item of array) {
    if (!isSameJSONValue(inferJSONStructureTypes(item), firstItemTypes)) {
      return false;
    }
  }
  return true;
}

function inferJSONStructureTypes(jsonStructure: JSONValue): JSONValue {
  if (Array.isArray(jsonStructure)) {
    if (allItemsSameType(jsonStructure)) {
      const itemType = inferJSONStructureTypes(jsonStructure[0]);
      return [itemType];
    }
    return jsonStructure.map(inferJSONStructureTypes);
  } else if (typeof jsonStructure === "object" && jsonStructure !== null) {
    const inferredObject: JSONObject = {};
    for (const key in jsonStructure) {
      inferredObject[key] = inferJSONStructureTypes(jsonStructure[key]);
    }
    return inferredObject;
  } else {
    return inferType(jsonStructure);
  }
}

const inferStructure = (data:any) => {
  const inferredTypes = inferJSONStructureTypes(data);
  return JSON.stringify(inferredTypes, null, 2);
}

function evaluateFunction(funcText: string, ...args: any[]): any {
  try {
    const func = eval(`(${funcText})`);
    if (typeof func === 'function') {
      return func(...args);
    } else {
      throw new Error('The provided text is not a function.');
    }
  } catch (error) {
    console.error('Error evaluating the function:', error);
    return null;
  }
}

const MODEL = "text-davinci-003";
//const MODEL = "gpt-4";
/*
write a typescript function that answers "any people named Aaron here?"
given the following structure {name:string}[], and only return the
function, not examples, in your answer
 */

const doCompletion = async (prompt: string) =>{

  const configuration = new Configuration({
    organization: "org-mU9sjpKKZe4g2e5QtGCJqY9Y",
    apiKey: process.env.OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const response = await openai.createCompletion({
    model: MODEL,
    prompt: prompt,
    temperature: 0,
    max_tokens: 1500,
  });

  return response.data.choices[0].text
}

const makePrompt = (question:string, data:any) => {

  return "write a javascript function that answers \"" + question + "\"\n" +
    "that is referenced in an object with the following JSON structure: " + inferStructure(data) +
    " as its only parameter, and only return the\n" +
    "function, not examples, in your answer"
}

const mainPromptParts = (question:string, data:any) => {
  const ask = "write a javascript function that answers \"" + question + "\"\n" +
    "that is referenced in an object with the following JSON structure:"
  const structure = inferStructure(data)
  const conditions = "as its only parameter, and only return the\n" +
    "function, not examples, in your answer"
  return {ask, structure, conditions}
}

const composeMainPrompt = (parts: {ask:string, structure:string, conditions:string}) => {
  return parts.ask + " " + parts.structure + " " + parts.conditions
}

const makeFinishPrompt = (rawAnswer: string, originalQuestion: string) => {
  return "state the answer \"" +  rawAnswer + "\" that may or may not be in JSON form to a human"
}

const formatCodePrompt = (code: string) =>{
  return "format the following code to be more readable by a human: " + code
}

type Data = {
  answer: string
  promptAsk: string
  promptStructure: string
  promptConditions: string
  computeFunction: string
  finishPrompt: string

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { question, subject } = req.query
  const questionAsString = question as string
  const subjectAsString = subject as string
  var data
  switch(subjectAsString) {
    case "political-contributions":
      data = await getContributorData(process.env.OPEN_SECRETS_KEY!, "2020", "CA")
      break
    case "covid-data":
      data = await getLatestCovidData()
      break
    default:
      data = DATA
  }
  const promptParts = mainPromptParts(questionAsString, data)
  const prompt = composeMainPrompt(promptParts)
  //console.log("PROMPT:")
  //console.log(prompt)
  const code = await doCompletion(prompt)
  const answer = evaluateFunction(code ?? "", data)
  const finishPrompt = makeFinishPrompt(JSON.stringify(answer), questionAsString)
  const finishedAnswer = await doCompletion(finishPrompt)
  const formatPrompt = formatCodePrompt(code!)
  const formattedCode = await doCompletion(formatPrompt)
  res.status(200).json({
    promptAsk: promptParts.ask, promptStructure: promptParts.structure, promptConditions: promptParts.conditions, answer: finishedAnswer ?? "No answer provided", computeFunction: formattedCode ?? "Code failed", finishPrompt})
}
