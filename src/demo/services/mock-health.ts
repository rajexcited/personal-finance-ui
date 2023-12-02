import MockAdapter from "axios-mock-adapter";

const MockHealth = (demoMock: MockAdapter) => {
  demoMock.onGet("/health/ping").reply(200, "alive");
};

export default MockHealth;
