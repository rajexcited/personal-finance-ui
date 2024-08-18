export const isBlank = (arg: string) => {
  if (arg && arg.replaceAll(/\s/g, "").length > 0) {
    return false;
  }
  return true;
};
