import demoMock from "./mock";
import MockConfigType from "./services/mock-config-type";
import MockLogin from "./services/mock-login";
import MockPaymentAccounts from "./services/mock-pymt-accounts";

MockLogin(demoMock);
MockConfigType(demoMock);
MockPaymentAccounts(demoMock);

export default demoMock;
