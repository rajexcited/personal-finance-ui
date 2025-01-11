import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getFullPath } from "../../../root";
import { PurchaseFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { Animated } from "../../../../components";
import { PurchaseDetailLoaderResource } from "../../route-handlers";
import { PurchaseForm } from "./modify-form/purchase-form";



export const AddPurchase: FunctionComponent = () => {
    const [purchaseId, setPurchaseId] = useState("");
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<PurchaseDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setPurchaseId(uuidv4());
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

    const onPurchaseAdded = (data: PurchaseFields, formData: FormData) => {
        if (auth.userDetails.isAuthenticated) {
            // logger.log("purchase added", data.purchaseId, data);
            submit(formData, { action: getFullPath("addPurchase"), method: "post", encType: "multipart/form-data" });
        } else {
            setErrorMessage("you have been logged out. please (login)[/login] to add purchase");
        }
    };

    return (
        <>
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp" scrollBeforePlayIn={ true }>
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
                        <PurchaseForm
                            key="add-purchase-form"
                            purchaseId={ purchaseId }
                            submitLabel={ navigation.state === "submitting" ? "Adding Purchase details..." : "Add" }
                            onSubmit={ onPurchaseAdded }
                            purchaseTypes={ loaderData.data.purchaseTypes }
                            paymentAccounts={ loaderData.data.paymentAccounts }
                            sourceTags={ loaderData.data.purchaseTags }
                            sharePersons={ loaderData.data.sharePersons }
                            currencyProfiles={ loaderData.data.currencyProfiles }
                        />
                    </div>
                </div>
            }
            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span>Not Allowed to add Purchase</span>
                    </div></div>
            }
        </>
    );
};
