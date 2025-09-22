import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import { PymtAccountFields, RouteHandlerResponse } from "../../services";
import AccountForm from "./account-form";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderResource } from "../../route-handlers/account-loader";
import { getLogger, testAttributes } from "../../../../shared";
import { getShortPath } from "../../../root/components/navigation";

const fcLogger = getLogger("FC.UpdatePymtAccount", null, null, "DEBUG");

const UpdateAccount: FunctionComponent = () => {
  const navigation = useNavigation();
  const submit = useSubmit();
  const auth = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountDetailLoaderResource, null>;
  const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
  const [submitLabel, setSubmitLabel] = useState("Update");

  useEffect(() => {
    if (loaderData.type === "error") {
      setErrorMessage(loaderData.errorMessage);
    } else if (actionData?.type === "error") {
      setErrorMessage(actionData.errorMessage);
    } else if (loaderData.type === "success" || actionData?.type === "success") {
      setErrorMessage("");
    }
  }, [actionData, loaderData]);

  useEffect(() => {
    const useEffectLogger = getLogger("useEffect.dep[navigation.state, navigation.location]", fcLogger);
    useEffectLogger.debug(
      "navigation state:",
      navigation.state,
      "; navigation location:",
      navigation.location,
      "; shortPath: ",
      getShortPath("updatePymAccount", loaderData.data?.pymtAccountDetail?.id)
    );
    if (navigation.state === "submitting") {
      setSubmitLabel("Updating...");
    } else if (
      navigation.state === "loading" &&
      !navigation.location?.pathname.endsWith(getShortPath("updatePymAccount", loaderData.data?.pymtAccountDetail?.id))
    ) {
      setSubmitLabel("Updated...");
    } else {
      setSubmitLabel("Update");
    }
  }, [navigation.state, navigation.location]);

  const onUpdateAccount = (data: PymtAccountFields) => {
    if (auth.userDetails.isAuthenticated) {
      const formData: any = { ...data };
      submit(formData, { action: getFullPath("updatePymAccount", data.id), method: "post", encType: "application/json" });
    } else {
      setErrorMessage("you have been logged out. please (login)[/login] to add payment account");
    }
  };

  return (
    <>
      {errorMessage && (
        <article className="message is-danger" {...testAttributes("update-payment-account-error-message")}>
          <div className="message-body">
            <ReactMarkdown children={errorMessage} />
          </div>
        </article>
      )}
      <div className="columns">
        <div className="column">
          {loaderData.type === "success" && !auth.readOnly && loaderData.data.pymtAccountDetail && (
            <AccountForm
              key="update-account-form"
              accountId={loaderData.data.pymtAccountDetail.id}
              submitLabel={submitLabel}
              onSubmit={onUpdateAccount}
              details={loaderData.data.pymtAccountDetail}
              sourceTags={loaderData.data.pymtAccountTags}
              categoryTypes={loaderData.data.categoryTypes}
              currencyProfiles={loaderData.data.currencyProfiles}
            />
          )}
        </div>
      </div>

      {auth.readOnly && (
        <div className="columns">
          <div className="column">
            <span>Not Allowed to update Payment Account</span>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateAccount;
