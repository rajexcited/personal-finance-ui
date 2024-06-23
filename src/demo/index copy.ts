import demoMock from "./mock";
import MockLogin from "./services/mock-login";
import MockConfigType from "./services/mock-config-type";
import MockExpenses from "./services/mock-expenses";
import MockPaymentAccounts from "./services/mock-pymt-accounts";

MockLogin(demoMock);
MockConfigType(demoMock);
MockPaymentAccounts(demoMock);
MockExpenses(demoMock);

export default demoMock;
