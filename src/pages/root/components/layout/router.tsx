import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./root";
import ErrorPage from "./error";
import { getShortPath, pathBaseName } from "../navigation";
import {
    PymtAccountsRoot,
    PymtAccountList,
    pymtAccountListLoaderHandler,
    AddPymtAccount, UpdatePymtAccount,
    pymtAccountActionHandler, pymtAccountDetailLoaderHandler, pymtAccountDetailSupportingLoaderHandler
} from '../../../pymt-accounts';
import {
    ExpenseJournalPage, ExpenseList, expenseListLoaderHandler,
    AddPurchase, UpdatePurchase,
    purchaseActionHandler, purchaseDetailLoaderHandler, purchaseDetailSupportingLoaderHandler,
    addRefundDetailLoaderHandler, modifyRefundDetailLoaderHandler,
    refundActionHandler
} from '../../../expenses';
import {
    SettingsRootPage,
    PurchaseTypePage,
    purchaseTypeListActionHandler, purchaseTypeListLoaderHandler,
    ProfileSettingsPage,
    profileDetailsActionHandler, profileDetailsLoaderHandler,
    PymtAccountTypePage,
    paymentAccountTypeListLoaderHandler, pymtAccTypeListActionHandler,
    SecurityPage,
    securityDetailsActionHandler, securityDetailsLoaderHandler,
    RefundReasonPage,
    refundReasonListActionHandler, refundReasonListLoaderHandler,
    IncomeTypePage,
    incomeTypeListActionHandler, incomeTypeListLoaderHandler
} from "../../../settings";
import { LoginPage, RequireAuth, SignupPage, LogoutPage } from "../../../auth";
import { HomePage } from "./home";
import { getLogger } from "../../services";
import { AddIncome, AddRefund, UpdateIncome, UpdateRefund } from "../../../expenses/components";
import { addIncomeDetailLoaderHandler, incomeActionHandler, modifyIncomeDetailLoaderHandler } from "../../../expenses/route-handlers";


const logger = getLogger("CBR.router", null, null, "DISABLED");
logger.debug("pathBaseName =", pathBaseName, ", rootPath =", getShortPath("rootPath"));

export const router = createBrowserRouter([
    {
        path: getShortPath("rootPath"),
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <HomePage /> },
            { path: getShortPath("loginPage"), element: <LoginPage /> },
            { path: getShortPath("signupPage"), element: <SignupPage /> },
            { path: getShortPath("logoutPage"), element: <LogoutPage /> },
            {
                path: getShortPath("expenseJournalRoot"),
                element: <RequireAuth><ExpenseJournalPage /></RequireAuth>,
                action: purchaseActionHandler,
                children: [
                    { index: true, element: <ExpenseList />, loader: expenseListLoaderHandler },
                    { path: getShortPath("addPurchase"), element: <AddPurchase />, loader: purchaseDetailSupportingLoaderHandler, action: purchaseActionHandler },
                    { path: getShortPath("updatePurchase"), element: <UpdatePurchase />, loader: purchaseDetailLoaderHandler, action: purchaseActionHandler },
                    { path: getShortPath("addPurchaseRefund"), element: <AddRefund />, loader: addRefundDetailLoaderHandler, action: refundActionHandler },
                    { path: getShortPath("updatePurchaseRefund"), element: <UpdateRefund />, loader: modifyRefundDetailLoaderHandler, action: refundActionHandler },
                    { path: getShortPath("addIncome"), element: <AddIncome />, loader: addIncomeDetailLoaderHandler, action: incomeActionHandler },
                    { path: getShortPath("updateIncome"), element: <UpdateIncome />, loader: modifyIncomeDetailLoaderHandler, action: incomeActionHandler }
                ]
            },
            {
                path: getShortPath("pymtAccountsRoot"),
                element: <RequireAuth><PymtAccountsRoot /></RequireAuth>,
                action: pymtAccountActionHandler,
                children: [
                    { index: true, element: <PymtAccountList />, loader: pymtAccountListLoaderHandler, },
                    { path: getShortPath("addPymAccount"), element: <AddPymtAccount />, loader: pymtAccountDetailSupportingLoaderHandler, action: pymtAccountActionHandler },
                    { path: getShortPath("updatePymAccount"), element: <UpdatePymtAccount />, loader: pymtAccountDetailLoaderHandler, action: pymtAccountActionHandler, },
                ]
            },
            {
                path: getShortPath("settingsRoot"),
                element: <RequireAuth><SettingsRootPage /></RequireAuth>,
                children: [
                    { index: true, element: <div>Settings Home - General Settings</div> },
                    { path: getShortPath("purchaseTypeSettings"), element: <PurchaseTypePage />, loader: purchaseTypeListLoaderHandler, action: purchaseTypeListActionHandler },
                    { path: getShortPath("pymtAccountTypeSettings"), element: <PymtAccountTypePage />, loader: paymentAccountTypeListLoaderHandler, action: pymtAccTypeListActionHandler },
                    { path: getShortPath("refundReasonSettings"), element: <RefundReasonPage />, loader: refundReasonListLoaderHandler, action: refundReasonListActionHandler },
                    { path: getShortPath("incomeTypeSettings"), element: <IncomeTypePage />, loader: incomeTypeListLoaderHandler, action: incomeTypeListActionHandler },
                    { path: getShortPath("profileSettings"), element: <ProfileSettingsPage />, loader: profileDetailsLoaderHandler, action: profileDetailsActionHandler },
                    { path: getShortPath("securitySettings"), element: <SecurityPage />, loader: securityDetailsLoaderHandler, action: securityDetailsActionHandler },
                ]
            }
        ]
    },
], {
    basename: pathBaseName
});