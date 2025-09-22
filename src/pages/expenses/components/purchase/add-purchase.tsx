import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import ReactMarkdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getFullPath } from "../../../root";
import { PurchaseFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { Animated } from "../../../../components";
import { PurchaseDetailLoaderResource } from "../../route-handlers";
import { PurchaseForm } from "./modify-form/purchase-form";
import { getLogger, testAttributes } from "../../../../shared";
import { getShortPath } from "../../../root/components/navigation";

const fcLogger = getLogger("FC.addPurchase", null, null, "DISABLED");

export const AddPurchase: FunctionComponent = () => {
  const [purchaseId, setPurchaseId] = useState("");
  const navigation = useNavigation();
  const submit = useSubmit();
  const auth = useAuth();
  // for error
  const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
  const loaderData = useLoaderData() as RouteHandlerResponse<PurchaseDetailLoaderResource, null>;
  const [errorMessage, setErrorMessage] = useState("");
  const [submitLabel, setSubmitLabel] = useState("Add");

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

  useEffect(() => {
    const useEffectLogger = getLogger("useEffect.dep[navigation.state, navigation.location]", fcLogger);
    useEffectLogger.debug("navigation state:", navigation.state, "; navigation location:", navigation.location, "; shortPath: ", getShortPath("addPurchase"));
    if (navigation.state === "submitting") {
      setSubmitLabel("Adding...");
    } else if (navigation.state === "loading" && !navigation.location?.pathname.endsWith(getShortPath("addPurchase"))) {
      setSubmitLabel("Added...");
    } else {
      setSubmitLabel("Add");
    }
  }, [navigation.state, navigation.location]);

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
      {errorMessage && (
        <Animated
          animateOnMount={true}
          isPlayIn={true}
          animatedIn="fadeInDown"
          animatedOut="fadeOutUp"
          scrollBeforePlayIn={true}
          {...testAttributes("add-purchase-error-message")}
        >
          <article className="message is-danger">
            <div className="message-body">
              <ReactMarkdown children={errorMessage} />
            </div>
          </article>
        </Animated>
      )}
      {loaderData.type === "success" && !auth.readOnly && (
        <div className="columns">
          <div className="column">
            <PurchaseForm
              key="add-purchase-form"
              purchaseId={purchaseId}
              submitLabel={submitLabel}
              onSubmit={onPurchaseAdded}
              purchaseTypes={loaderData.data.purchaseTypes}
              paymentAccounts={loaderData.data.paymentAccounts}
              sourceTags={loaderData.data.purchaseTags}
              sharePersons={loaderData.data.sharePersons}
              currencyProfiles={loaderData.data.currencyProfiles}
            />
          </div>
        </div>
      )}
      {auth.readOnly && (
        <div className="columns">
          <div className="column">
            <span {...testAttributes("add-purchase-not-allowed")}>Not Allowed to add Purchase</span>
          </div>
        </div>
      )}
    </>
  );
};
