import demoMock from "./mock";
import { MockLogin } from "./services/mock-login";
import { MockConfigType } from "./services/mock-config-type";
import { MockPaymentAccounts } from "./services/mock-pymt-accounts";
import { MockExpenses } from "./services/mock-expenses";
import { MockPurchase } from "./services/mock-purchase";

MockLogin(demoMock);
MockConfigType(demoMock);
MockPaymentAccounts(demoMock);
MockExpenses(demoMock);
MockPurchase(demoMock);

export default demoMock;
