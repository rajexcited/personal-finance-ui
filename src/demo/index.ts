import demoMock from "./mock";
import { MockLogin } from "./services/mock-login";
import { MockConfigType } from "./services/mock-config-type";
import { MockPaymentAccounts } from "./services/mock-pymt-accounts";
import { MockExpenses } from "./services/mock-expenses";
import { MockPurchase } from "./services/mock-purchase";
import { MockIncome } from "./services/mock-income";
import { MockRefund } from "./services/mock-refund";

MockLogin(demoMock);
MockConfigType(demoMock);
MockPaymentAccounts(demoMock);
MockPurchase(demoMock);
MockIncome(demoMock);
MockRefund(demoMock);
MockExpenses(demoMock);

export default demoMock;
