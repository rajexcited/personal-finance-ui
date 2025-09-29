import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import ReactMarkdown from "react-markdown";
import "bulma-extensions/bulma-tooltip/dist/css/bulma-tooltip.min.css";
import { getLogger, PurchaseRefundFields, RouteHandlerResponse } from "../../services";
import { useAuth } from "../../../auth";
import { getFullPath } from "../../../root";
import { Animated } from "../../../../components";
import { PurchaseRefundForm } from "./refund-form";
import { RefundDetailLoaderResource } from "../../route-handlers";
import { testAttributes } from "../../../../shared";
import { getShortPath } from "../../../root/components/navigation";

const fcLogger = getLogger("FC.UpdateRefund", null, null, "DISABLED");

export const UpdateRefund: FunctionComponent = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();
  const submit = useSubmit();
  const loaderData = useLoaderData() as RouteHandlerResponse<RefundDetailLoaderResource, null>;
  const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
  const auth = useAuth();
  const [submitLabel, setSubmitLabel] = useState("Update");

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

  useEffect(() => {
    const useEffectLogger = getLogger("useEffect.dep[navigation.state, navigation.location]", fcLogger);
    useEffectLogger.debug(
      "navigation state:",
      navigation.state,
      "; navigation location:",
      navigation.location,
      "; shortPath: ",
      getShortPath("updatePurchaseRefund", loaderData.data?.refundDetail?.id)
    );
    if (navigation.state === "submitting") {
      setSubmitLabel("Updating...");
    } else if (
      navigation.state === "loading" &&
      !navigation.location?.pathname.endsWith(getShortPath("updatePurchaseRefund", loaderData.data?.refundDetail?.id))
    ) {
      setSubmitLabel("Updated...");
    } else {
      setSubmitLabel("Update");
    }
  }, [navigation.state, navigation.location]);

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

  fcLogger.debug(
    "navigation state =",
    navigation.state,
    ", text =",
    navigation.text,
    ", location =",
    navigation.location,
    ", formAction =",
    navigation.formAction
  );

  return (
    <>
      {errorMessage && (
        <Animated
          animateOnMount={true}
          isPlayIn={true}
          animatedIn="fadeInDown"
          animatedOut="fadeOutUp"
          scrollBeforePlayIn={true}
          {...testAttributes("update-refund-error-message")}
        >
          <article className="message is-danger">
            <div className="message-body">
              <ReactMarkdown children={errorMessage} />
            </div>
          </article>
        </Animated>
      )}

      <div className="columns">
        <div className="column">
          {loaderData.type === "success" && !auth.readOnly && loaderData.data.refundDetail && (
            <PurchaseRefundForm
              key="update-purchase-form"
              submitLabel={submitLabel}
              onSubmit={onRefundUpdated}
              refundId={loaderData.data.refundDetail.id}
              refundDetails={loaderData.data.refundDetail}
              purchaseDetails={loaderData.data.purchaseDetail}
              paymentAccounts={loaderData.data.paymentAccounts}
              sourceTags={loaderData.data.refundTags}
              reasons={loaderData.data.refundReasons}
              sharePersons={loaderData.data.sharePersons}
              currencyProfiles={loaderData.data.currencyProfiles}
            />
          )}
        </div>
      </div>

      {auth.readOnly && (
        <div className="columns">
          <div className="column">
            <span {...testAttributes("update-refund-not-allowed")}>Not Allowed to update Refund</span>
          </div>
        </div>
      )}
    </>
  );
};
