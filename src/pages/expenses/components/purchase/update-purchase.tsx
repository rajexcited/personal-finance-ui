import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { PurchaseForm } from "./form/purchase-form";
import { getLogger, PurchaseFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { getFullPath } from "../../../root";
import { Animated } from "../../../../components";
import { PurchaseDetailLoaderResource } from "../../route-handlers";


const fcLogger = getLogger("FC.UpdatePurchase", null, null, "INFO");

export const UpdatePurchase: FunctionComponent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const loaderData = useLoaderData() as RouteHandlerResponse<PurchaseDetailLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const auth = useAuth();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[actionData, loaderData, auth]", fcLogger);
        if (loaderData.type === "error") {
            logger.debug("found error in loader data = ", loaderData.errorMessage);
            setErrorMessage(loaderData.errorMessage);
        }
        else if (actionData?.type === "error") {
            logger.debug("found error in action data = ", actionData.errorMessage);
            setErrorMessage(actionData.errorMessage);
        } else if (!auth.userDetails.isAuthenticated) {
            logger.debug("user is not authenticated");
            setErrorMessage("you have been logged out. please (login)[/login] to add payment account");
        } else {
            logger.debug("success scenario, cleaning error");
            setErrorMessage("");
        }
    }, [actionData, loaderData, auth]);

    const onPurchaseUpdated = (data: PurchaseFields, formData: FormData) => {
        if (auth.userDetails.isAuthenticated) {
            // logger.log("purchase updated", data.purchaseId, data, data.items, "same as loader purchase? ", loaderData.purchaseDetail?.purchaseId === data.purchaseId, "object difference = ", JSON.stringify(difference(data, loaderData.purchaseDetail)));
            submit(formData, { action: getFullPath("updatePurchase", data.id), method: "post", encType: "multipart/form-data" });
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
                        loaderData.type === "success" && loaderData.data.purchaseDetail &&
                        <PurchaseForm
                            key="update-purchase-form"
                            purchaseId={ loaderData.data.purchaseDetail.id }
                            submitLabel={ navigation.state === "submitting" ? "Saving Account details..." : "Update" }
                            onSubmit={ onPurchaseUpdated }
                            details={ loaderData.data.purchaseDetail }
                            purchaseTypes={ loaderData.data.purchaseTypes }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.purchaseTags }
                        />
                    }
                </div>
            </div>
        </>
    );
};

