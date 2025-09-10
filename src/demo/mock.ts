import MockAdapter from "axios-mock-adapter";
import { axios } from "../shared";

// const demoMock = new MockAdapter(axios, { delayResponse: 3000, onNoMatch: "throwException" });
const demoMock = new MockAdapter(axios, { delayResponse: 500, onNoMatch: "throwException" });

export default demoMock;
