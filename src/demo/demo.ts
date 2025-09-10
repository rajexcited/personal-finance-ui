import demoMock from "./mock";
import { MockUser } from "./services/mock-user";
import { MockConfigType } from "./services/mock-config-type";
import { MockPaymentAccounts } from "./services/mock-pymt-accounts";
import { MockExpenses } from "./services/mock-expenses";
import { MockPurchase } from "./services/mock-purchase";
import { MockIncome } from "./services/mock-income";
import { MockRefund } from "./services/mock-refund";
import { MockStats } from "./services/mock-stats";

MockUser(demoMock);
MockConfigType(demoMock);
MockPaymentAccounts(demoMock);
MockPurchase(demoMock);
MockIncome(demoMock);
MockRefund(demoMock);
MockExpenses(demoMock);
MockStats(demoMock);

export const isDemo = true;
export default demoMock;
