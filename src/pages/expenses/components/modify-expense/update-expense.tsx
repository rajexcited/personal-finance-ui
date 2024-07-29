import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import ExpenseForm from "./expense-form";
import { ExpenseFields } from "../../services";
import { useAuth } from "../../../auth";
import { PAGE_URL } from "../../../root";
import ReactMarkdown from "react-markdown";
import { Animated } from "../../../../components";
import { ExpenseDetailLoaderResource } from "../../route-handlers/expense-loader";
import { RouteHandlerResponse } from "../../../../services";


const UpdateExpense: FunctionComponent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const loaderData = useLoaderData() as RouteHandlerResponse<ExpenseDetailLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const auth = useAuth();

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        }
        else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else if (auth.userDetails.isAuthenticated) {
            setErrorMessage("");
        }
    }, [actionData, loaderData, auth]);

    const onExpenseUpdated = (data: ExpenseFields, formData: FormData) => {
        if (auth.userDetails.isAuthenticated) {
            // logger.log("expense updated", data.expenseId, data, data.expenseItems, "same as loader expense? ", loaderData.expenseDetail?.expenseId === data.expenseId, "object difference = ", JSON.stringify(difference(data, loaderData.expenseDetail)));
            submit(formData, { action: PAGE_URL.updateExpense.fullUrl.replace(":expenseId", data.id), method: "post", encType: "multipart/form-data" });
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
                </Animated >
            }

            <div className="columns">
                <div className="column">
                    {
                        loaderData.type === "success" && loaderData.data.expenseDetail &&
                        <ExpenseForm
                            key="update-expense-form"
                            expenseId={ loaderData.data.expenseDetail.id }
                            submitLabel={ navigation.state === "submitting" ? "Saving Account details..." : "Update" }
                            onSubmit={ onExpenseUpdated }
                            details={ loaderData.data.expenseDetail }
                            categoryTypes={ loaderData.data.categoryTypes }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.expenseTags }
                        />
                    }
                </div>
            </div>
        </>
    );
};

export default UpdateExpense;