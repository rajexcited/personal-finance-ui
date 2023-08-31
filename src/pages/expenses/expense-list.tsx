import { FunctionComponent, useState, useContext, useEffect } from "react";
import { ExpenseData, ExpenseContext } from "./expense-context";
import ExpenseItemCard from "./expense-item-view";
import ExpenseService from "./expenses-service";

const expenseService = await ExpenseService();

const ExpenseList: FunctionComponent = () => {
    const expenses = useContext(ExpenseContext);
    const [expenseList, setExpenseList] = useState<ExpenseData[]>(expenses);

    useEffect(() => {
        if (expenseList.length == 0) {
            (async () => {
                const list = await expenseService.getExpenses();
                setExpenseList([...list]);
                expenses.push(...list);
            })();
        }
    }, []);

    return (
        <ExpenseContext.Provider value={ expenseList }>
            <section className="container">
                {
                    !expenseList.length &&
                    <p className="title">There are no expenses</p>
                }
                { expenseList.map(xpns =>
                    <ExpenseItemCard
                        key={ xpns.expenseId + "viewcard" }
                        id={ xpns.expenseId + "viewcard" }
                        details={ xpns }
                    />)
                }
            </section>
        </ExpenseContext.Provider>
    );
};

export default ExpenseList;