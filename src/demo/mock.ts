import MockAdapter from "axios-mock-adapter";
import { axios } from "../services";

const demoMock = new MockAdapter(axios, { delayResponse: 3000, onNoMatch: "throwException" });

export default demoMock;
