import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getLogger, PurchaseRefundFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { getFullPath } from "../../../root";
import { Animated } from "../../../../components";
import { PurchaseRefundForm } from "./refund-form";
import { RefundDetailLoaderResource } from "../../route-handlers";


const fcLogger = getLogger("FC.UpdateRefund", null, null, "DISABLED");

export const UpdateRefund: FunctionComponent = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const loaderData = useLoaderData() as RouteHandlerResponse<RefundDetailLoaderResource, null>;
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
            setErrorMessage("you have been logged out. please (login)[/login] to add payment account");

        } else {
            logger.debug("success scenario, cleaning error");
            setErrorMessage("");

        }
    }, [actionData, loaderData, auth]);

    const onRefundUpdated = (data: PurchaseRefundFields, formData: FormData) => {
        const logger = getLogger("onRefundUpdated", fcLogger);
        if (auth.userDetails.isAuthenticated) {
            // logger.debug("purchase updated", data.purchaseId, data, data.items, "same as loader purchase? ", loaderData.purchaseDetail?.purchaseId === data.purchaseId, "object difference = ", JSON.stringify(difference(data, loaderData.purchaseDetail)));
            submit(formData, { action: getFullPath("updatePurchaseRefund", data.id), method: "post", encType: "multipart/form-data" });
        } else {
            //todo verify
            // this is probably never getting called.
            logger.warn("user is not authenticated. details = ", { ...auth.userDetails });
            setErrorMessage("you have been logged out. please (login)[/login] to update refund");
        }
    };

    fcLogger.debug("navigation state =", navigation.state, ", text =", navigation.text, ", location =", navigation.location, ", formAction =", navigation.formAction);

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
                        loaderData.type === "success" && !auth.readOnly && loaderData.data.refundDetail &&
                        <PurchaseRefundForm
                            key="update-purchase-form"
                            submitLabel={ navigation.state === "submitting" ? "Saving Refund details..." : "Update" }
                            onSubmit={ onRefundUpdated }
                            refundId={ loaderData.data.refundDetail.id }
                            refundDetails={ loaderData.data.refundDetail }
                            purchaseDetails={ loaderData.data.purchaseDetail }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.refundTags }
                            reasons={ loaderData.data.refundReasons }
                        />
                    }
                </div>
            </div>

            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span>Not Allowed to update Refund</span>
                    </div></div>
            }
        </>
    );
};

