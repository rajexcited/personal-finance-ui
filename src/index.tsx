import 'bulma/css/bulma.min.css';
import "./index.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout, ErrorPage, ExpenseJournalPage, PAGE_URL, AddExpense } from "./pages";
import { AccountList, AccountsHome, AddAccount } from './pages/accounts';
import { ExpenseList } from './pages/expenses';

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <div>Home page</div> },
            {
                path: PAGE_URL.expenseJournal.shortUrl,
                element: <ExpenseJournalPage />,
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <ExpenseList /> },
                    { path: PAGE_URL.addExpense.shortUrl, element: <AddExpense /> },
                    { path: PAGE_URL.addReceipt.shortUrl, element: <div>add receipt</div> }
                ]
            },
            {
                path: PAGE_URL.accounts.shortUrl,
                element: <AccountsHome />,
                errorElement: <ErrorPage />,
                children: [
                    { index: true, element: <AccountList /> },
                    { path: PAGE_URL.addAccount.shortUrl, element: <AddAccount /> }
                ]
            }
        ]
    },
]);

const App = () => {
    return <RouterProvider router={ router } />;
};

const domNode = document.querySelector("#root");
if (domNode) {
    const root = createRoot(domNode);
    root.render(<App />);
}
