export const missingValidation = (data: any, keys: string[]) => {
  if (!data) {
    return [{ loc: ["data"], msg: "invalid data" }];
  }
  const errors = keys
    .filter((key) => !(data[key] || data[key].trim()))
    .map((key) => ({ loc: [key], msg: "missing " + key }));

  if (errors.length !== 0) {
    return errors;
  }
};

export const validateUuid = (uuid: string, key: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!regex.test(uuid)) {
    return [{ loc: [key], msg: "invalid id" }];
  }
};
