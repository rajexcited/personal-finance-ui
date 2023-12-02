import _ from "lodash";

declare global {
  interface Window {
    difference(object: any, baseObject: any): any;
  }
}

const changes = (object: any, baseObj: any) => {
  return _.transform(object, (result: any, value: any, key: string) => {
    if (!_.isEqual(value, baseObj[key])) {
      result[key] =
        _.isObject(value) && _.isObject(baseObj[key])
          ? changes(value, baseObj[key])
          : { new: value, old: baseObj[key] };
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
 */
const difference = (object: any, baseObject: any) => {
  const result1 = flattenObject(changes(object, baseObject));
  const result2 = flattenObject(changes(baseObject, object));

  _.difference(Object.keys(result2), Object.keys(result1)).forEach((k) => {
    result1[k] = result2[k];
  });

  return result1;
};

const flattenObject = (obj: any, prefix: string = ""): any => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? prefix + "." + key : key;

    return !hasDiff(value) ? { ...acc, ...flattenObject(value, newKey) } : { ...acc, [newKey]: value };
  }, {});
};

const hasDiff = (obj: any) => {
  return _.isObject(obj) && "new" in obj && "old" in obj;
};

export default difference;

window.difference = difference;
