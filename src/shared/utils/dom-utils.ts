import Cookies from "js-cookie";

const isAutomationTest = () => {
  const testCookie = Cookies.get(process.env.REACT_APP_TEST_COOKIE_KEY || "");
  // console.log(
  //   "Cookies.attributes=",
  //   Cookies.attributes,
  //   "allCookies=",
  //   Cookies.get(),
  //   "TEST_COOKIE_KEY=",
  //   process.env.REACT_APP_TEST_COOKIE_KEY,
  //   "testCookie=",
  //   testCookie,
  //   "REACT_APP_TEST_ATTR_ADD=",
  //   process.env.REACT_APP_TEST_ATTR_ADD
  // );
  return process.env.REACT_APP_TEST_ATTR_ADD === testCookie;
};

export const testAttributes = (attrValues: string[] | string) => {
  const attrObj: Record<string, string> = {};
  if (isAutomationTest()) {
    if (!Array.isArray(attrValues)) {
      attrValues = ["test", attrValues];
    }
    for (let i = 0; i < attrValues.length; i = i + 2) {
      const dataKey = attrValues[i].startsWith("data-") ? attrValues[i] : "data-" + attrValues[i];
      attrObj[dataKey] = attrValues[i + 1] || attrValues[i];
    }
  }
  return attrObj;
};
