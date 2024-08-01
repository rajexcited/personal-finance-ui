import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getFullPath } from "../../../root";
import ExpenseForm from "./expense-form";
import { ExpenseFields } from "../../services";
import { useAuth } from "../../../auth";
import { Animated } from "../../../../components";
import { ExpenseDetailLoaderResource } from "../../route-handlers/expense-loader";
import { RouteHandlerResponse } from "../../../../services";


const AddExpense: FunctionComponent = () => {
    const [expenseId, setExpenseId] = useState("");
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<ExpenseDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setExpenseId(uuidv4());
    }, []);

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else if (auth.userDetails.isAuthenticated) {
            setErrorMessage("");
        }
    }, [loaderData, actionData, auth]);

    const onExpenseAdded = (data: ExpenseFields, formData: FormData) => {
        if (auth.userDetails.isAuthenticated) {
            // logger.log("expense added", data.expenseId, data);
            submit(formData, { action: getFullPath("addExpense"), method: "post", encType: "multipart/form-data" });
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
            { loaderData.type === "success" &&
                <div className="columns">
                    <div className="column">
                        <ExpenseForm
                            key="add-expense-form"
                            expenseId={ expenseId }
                            submitLabel={ navigation.state === "submitting" ? "Adding Expense details..." : "Add" }
                            onSubmit={ onExpenseAdded }
                            categoryTypes={ loaderData.data.categoryTypes }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.expenseTags }
                        />
                    </div>
                </div>
            }
        </>
    );
};

export default AddExpense;