import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PAGE_URL } from "../../../root/components/navigation/page-url";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import ExpenseForm from "./expense-form";
import { v4 as uuidv4 } from "uuid";
import { ExpenseFields } from "../../services";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { Animated } from "../../../../components";
import { ExpenseDetailLoaderType } from "../../route-handlers/expense-loader";


const AddExpense: FunctionComponent = () => {
    const [expenseId, setExpenseId] = useState("");
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData: any = useActionData();
    const loaderData = useLoaderData() as ExpenseDetailLoaderType;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setExpenseId(uuidv4());
    }, []);

    useEffect(() => {
        if (actionData?.errorMessage && actionData.errorMessage !== errorMessage)
            setErrorMessage(actionData.errorMessage);
    }, [errorMessage, actionData?.errorMessage]);

    const onExpenseAdded = (data: ExpenseFields) => {
        if (auth.isAuthenticated) {
            const formData: any = {
                ...data
            };
            submit(formData, { action: PAGE_URL.addExpense.fullUrl, method: "post", encType: "application/json" });
        } else {
            setErrorMessage("you have been logged out. please (login)[/login] to add payment account");
        }
    };

    return (
        <>
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp">
                    <article className="message is-danger">
                        <div className="message-body">
                            <ReactMarkdown children={ errorMessage } />
                        </div>
                    </article>
                </Animated>
            }
            <div className="columns">
                <div className="column">
                    <ExpenseForm
                        key="add-expense-form"
                        expenseId={ expenseId }
                        submitLabel={ navigation.state === "submitting" ? "Adding Expense details..." : "Add" }
                        onSubmit={ onExpenseAdded }
                        categoryTypes={ loaderData.categoryTypes }
                        paymentAccounts={ loaderData.paymentAccounts }
                        sourceTags={ loaderData.expenseTags }
                    />
                </div>
            </div>
        </>
    );
};

export default AddExpense;