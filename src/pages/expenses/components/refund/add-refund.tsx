import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import { Animated } from "../../../../components";
import { getLogger, PurchaseRefundFields, RouteHandlerResponse } from "../../services";
import { PurchaseRefundForm } from "./refund-form";
import { RefundDetailLoaderResource } from "../../route-handlers";
import { testAttributes } from "../../../../shared";


const fcLogger = getLogger("FC.AddRefund", null, null, "DISABLED");

export const AddRefund: FunctionComponent = () => {
    const [refundId, setRefundId] = useState("");
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<RefundDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setRefundId(uuidv4());
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

    const onRefundAdded = (data: PurchaseRefundFields, formData: FormData) => {
        const logger = getLogger("onRefundAdded", fcLogger);
        if (auth.userDetails.isAuthenticated) {
            // logger.debug("purchase added", data.purchaseId, data);
            submit(formData, { action: getFullPath("addPurchaseRefund", data.purchaseId || "unknown"), method: "post", encType: "multipart/form-data" });
        } else {
            //todo verify
            // this is probably never getting called.
            logger.warn("user is not authenticated. details = ", { ...auth.userDetails });
            setErrorMessage("you have been logged out. please (login)[/login] to add refund");
        }
    };

    fcLogger.debug("navigation state =", navigation.state, ", text =", navigation.text, ", location =", navigation.location, ", formAction =", navigation.formAction);

    return (
        <>
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp"
                    scrollBeforePlayIn={ true } { ...testAttributes("add-refund-error-message") }>
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
                        <PurchaseRefundForm
                            key="add-purchase-refund-form"
                            submitLabel={ navigation.state === "submitting" ? "Adding Refund details..." : "Add" }
                            onSubmit={ onRefundAdded }
                            refundId={ refundId }
                            purchaseDetails={ loaderData.data.purchaseDetail }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.refundTags }
                            reasons={ loaderData.data.refundReasons }
                            sharePersons={ loaderData.data.sharePersons }
                            currencyProfiles={ loaderData.data.currencyProfiles }
                        />
                    </div>
                </div>
            }
            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span { ...testAttributes("add-refund-not-allowed") }>Not Allowed to add Refund</span>
                    </div></div>
            }
        </>
    );
};
