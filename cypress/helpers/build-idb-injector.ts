// cypress/helpers/inject-idb.js
import fs from "fs";
import path from "path";

// 1. Read the module you want to inject (raw)
const idbCode = fs.readFileSync(path.resolve(__dirname, "../../node_modules/idb/build/index.cjs"), "utf8");

// 2. Wrap it in a fake CommonJS environment
const wrapped = `
((exports) => {
  ${idbCode}
})(window.__idb__={});
`;

const outputFilePath = path.resolve(__dirname, "../../cypress/fixtures/idb-bundle.js.txt");
fs.writeFileSync(outputFilePath, wrapped, "utf8");
console.log("indexed Db injector script is generated at", outputFilePath);
