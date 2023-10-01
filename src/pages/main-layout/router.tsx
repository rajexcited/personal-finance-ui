import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./root";
import ErrorPage from "./error";
import { PAGE_URL } from "../navigation";
import {
    PymtAccountList,
    PymtAccountsRoot,
    AddPymtAccount,
    UpdatePymtAccount,
    pymtAccountListLoader,
    pymtAccountAddUpdateAction,
    pymtAccountDetailLoader
} from '../pymt-accounts';
import { AddExpense, ExpenseJournalPage, ExpenseList, UpdateExpense } from '../expenses';
import { ExpenseCategoryPage, PymtAccountTypePage, SettingsRoot } from "../settings";
import { LoginPage, RequireAuth, SignupPage } from "../auth";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <div>Home page</div> },
            { path: PAGE_URL.loginPage.shortUrl, element: <LoginPage /> },
            { path: PAGE_URL.signupPage.shortUrl, element: <SignupPage /> },
            {
                path: PAGE_URL.expenseJournalRoot.shortUrl,
                element: <RequireAuth><ExpenseJournalPage /></RequireAuth>,
                children: [
                    { index: true, element: <ExpenseList /> },
                    { path: PAGE_URL.addExpense.shortUrl, element: <AddExpense /> },
                    { path: PAGE_URL.updateExpense.shortUrl, element: <UpdateExpense /> },
                ]
            },
            {
                path: PAGE_URL.pymtAccountsRoot.shortUrl,
                element: <RequireAuth><PymtAccountsRoot /></RequireAuth>,
                children: [
                    { index: true, element: <PymtAccountList />, loader: pymtAccountListLoader, action: pymtAccountAddUpdateAction, },
                    { path: PAGE_URL.addPymAccount.shortUrl, element: <AddPymtAccount />, action: pymtAccountAddUpdateAction },
                    { path: PAGE_URL.updatePymAccount.shortUrl, element: <UpdatePymtAccount />, loader: pymtAccountDetailLoader },
                ]
            },
            {
                path: PAGE_URL.settingsRoot.shortUrl,
                element: <RequireAuth><SettingsRoot /></RequireAuth>,
                children: [
                    { index: true, element: <div>Settings Home</div> },
                    { path: PAGE_URL.expenseCategorySettings.shortUrl, element: <ExpenseCategoryPage /> },
                    { path: PAGE_URL.pymtAccountTypeSettings.shortUrl, element: <PymtAccountTypePage /> },
                    { path: PAGE_URL.tagsSettings.shortUrl, element: <div> tags settings </div> },
                    { path: PAGE_URL.profileSettings.shortUrl, element: <div> Profile settings </div> },
                ]
            }
        ]
    },
]);