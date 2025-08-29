import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import { Animated } from "../../../../components";
import { getLogger, IncomeFields, RouteHandlerResponse } from "../../services";
import { IncomeDetailLoaderResource } from "../../route-handlers";
import { IncomeForm } from "./income-form";
import { testAttributes } from "../../../../shared";


const fcLogger = getLogger("FC.AddIncome", null, null, "DISABLED");

export const AddIncome: FunctionComponent = () => {
    const [incomeId, setIncomeId] = useState("");
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<IncomeDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setIncomeId(uuidv4());
    }, []);

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else {
            setErrorMessage("");
        }
    }, [loaderData, actionData]);

    const onIncomeAdded = (data: IncomeFields, formData: FormData) => {
        const logger = getLogger("onIncomeAdded", fcLogger);
        if (auth.userDetails.isAuthenticated) {
            // logger.debug("purchase added", data.purchaseId, data);
            submit(formData, { action: getFullPath("addIncome"), method: "post", encType: "multipart/form-data" });
        } else {
            //todo verify
            // this is probably never getting called.
            logger.warn("user is not authenticated. details = ", { ...auth.userDetails });
            setErrorMessage("you have been logged out. please (login)[/login] to add income");
        }
    };

    fcLogger.debug("navigation state =", navigation.state, ", text =", navigation.text, ", location =", navigation.location, ", formAction =", navigation.formAction);

    return (
        <>
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp"
                    scrollBeforePlayIn={ true } { ...testAttributes("add-income-error-message") }>
                    <article className="message is-danger">
                        <div className="message-body">
                            <ReactMarkdown children={ errorMessage } />
                        </div>
                    </article>
                </Animated>
            }
            { loaderData.type === "success" && !auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <IncomeForm
                            key="add-income-form"
                            submitLabel={ navigation.state === "submitting" ? "Adding Income details..." : "Add" }
                            onSubmit={ onIncomeAdded }
                            incomeId={ incomeId }
                            incomeDetails={ loaderData.data.incomeDetail }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.incomeTags }
                            incomeTypes={ loaderData.data.incomeTypes }
                            sharePersons={ loaderData.data.sharePersons }
                            currencyProfiles={ loaderData.data.currencyProfiles }
                        />
                    </div>
                </div>
            }
            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span { ...testAttributes("add-income-not-allowed") }>Not Allowed to add Income</span>
                    </div></div>
            }
        </>
    );
};
