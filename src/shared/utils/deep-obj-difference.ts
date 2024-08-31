import _ from "lodash";

// declare global {
//   interface Window {
//     difference(object: any, baseObject: any): any;
//   }
// }

type JSONValue = string | number | boolean | Date | JSONObject | JSONArray | null | undefined;
export interface JSONObject {
  [key: string]: JSONValue;
}
export type JSONArray = Array<JSONValue>;

const changes = (object: any, baseObj: any) => {
  return _.transform(object, (result: JSONObject, value: JSONValue, key: string | number) => {
    const bv = baseObj[key];
    if (!_.isEqual(value, bv)) {
      result[key] = _.isObject(value) && _.isObject(baseObj[key]) ? changes(value, baseObj[key]) : { new: value, old: baseObj[key] };
    }
  });
};

/**
 * To add property to window, need to update Window typescript interface to prevent compilation error
 * https://www.totaltypescript.com/how-to-properly-type-window
 * 
 * ex. 
declare global {
  interface Window {
    myProperty: any;
  }
}
 *
**/
export const ObjectDeepDifference = (object: JSONObject | JSONArray, baseObject: JSONObject | JSONArray) => {
  const result1 = flattenObject(changes(object, baseObject));
  const result2 = flattenObject(changes(baseObject, object));

  _.difference(Object.keys(result2), Object.keys(result1)).forEach((k) => {
    result1[k] = result2[k];
  });

  return result1 as Record<string, any>;
};

const flattenObject = (obj: JSONObject, prefix: string = "") => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? prefix + "." + key : key;

    if (!hasDiff(value)) {
      const fltnobj: JSONObject = flattenObject(value as JSONObject, newKey);
      return { ...acc, ...fltnobj };
    }

    const res: JSONObject = { ...acc };
    res[newKey] = value;
    return res;
  }, {} as JSONObject);
};

const hasDiff = (obj: JSONValue) => {
  return _.isObject(obj) && "new" in obj && "old" in obj;
};

// window.difference = difference;
