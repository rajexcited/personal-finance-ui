import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getLogger, IncomeFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { getFullPath } from "../../../root";
import { Animated } from "../../../../components";
import { IncomeDetailLoaderResource } from "../../route-handlers";
import { IncomeForm } from "./income-form";
import { testAttributes } from "../../../../shared";


const fcLogger = getLogger("FC.UpdateIncome", null, null, "DISABLED");

export const UpdateIncome: FunctionComponent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const loaderData = useLoaderData() as RouteHandlerResponse<IncomeDetailLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const auth = useAuth();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[actionData, loaderData, auth]", fcLogger);
        if (loaderData.type === "error") {
            logger.debug("found error in loader data = ", loaderData.errorMessage);
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            logger.debug("found error in action data = ", actionData.errorMessage);
            setErrorMessage(actionData.errorMessage);
        } else if (!auth.userDetails.isAuthenticated) {
            //todo verify
            // this is probably never getting called.
            logger.debug("user is not authenticated");
            setErrorMessage("you have been logged out. please (login)[/login] to update income");
        } else {
            logger.debug("success scenario, cleaning error");
            setErrorMessage("");
        }
    }, [actionData, loaderData, auth]);

    const onIncomeUpdated = (data: IncomeFields, formData: FormData) => {
        const logger = getLogger("onIncomeUpdated", fcLogger);
        if (auth.userDetails.isAuthenticated) {
            // logger.debug("purchase updated", data.purchaseId, data, data.items, "same as loader purchase? ", loaderData.purchaseDetail?.purchaseId === data.purchaseId, "object difference = ", JSON.stringify(difference(data, loaderData.purchaseDetail)));
            submit(formData, { action: getFullPath("updateIncome", data.id), method: "post", encType: "multipart/form-data" });
        } else {
            //todo verify
            // this is probably never getting called.
            logger.warn("user is not authenticated. details = ", { ...auth.userDetails });
            setErrorMessage("you have been logged out. please (login)[/login] to update income");
        }
    };

    fcLogger.debug("navigation state =", navigation.state, ", text =", navigation.text, ", location =", navigation.location, ", formAction =", navigation.formAction);

    return (
        <>
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp"
                    scrollBeforePlayIn={ true } { ...testAttributes("update-income-error-message") }>
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
                        loaderData.type === "success" && !auth.readOnly && loaderData.data.incomeDetail &&
                        <IncomeForm
                            key="update-income-form"
                            submitLabel={ navigation.state === "submitting" ? "Saving Income details..." : "Update" }
                            onSubmit={ onIncomeUpdated }
                            incomeId={ loaderData.data.incomeDetail.id }
                            incomeDetails={ loaderData.data.incomeDetail }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.incomeTags }
                            incomeTypes={ loaderData.data.incomeTypes }
                            sharePersons={ loaderData.data.sharePersons }
                            currencyProfiles={ loaderData.data.currencyProfiles }
                        />
                    }
                </div>
            </div>

            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span { ...testAttributes("update-income-not-allowed") }>Not Allowed to update Income</span>
                    </div></div>
            }
        </>
    );
};

