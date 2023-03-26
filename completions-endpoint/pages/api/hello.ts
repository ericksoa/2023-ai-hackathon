import type {NextApiRequest, NextApiResponse} from 'next'
import {Configuration, OpenAIApi} from "openai"
import {getContributorData} from "@/pages/api/openSecrets";
import {getLatestCovidData} from "@/pages/api/covid";

const DATA = [{ name: "Aaron Erickson", age: 50, skills: [ "AI", "Being a smart ass"]}, { name: "Fred Flintstone", age: 47, skills: [ "AI", "Being a smart ass"]}]
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
  return "explain the answer \"" +  rawAnswer + "\" to a human in the context of the following question: \"" + originalQuestion + "\". For purposes of this, assume the answer is correct."
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
