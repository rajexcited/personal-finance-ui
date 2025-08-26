import { FunctionComponent, useState, useEffect } from "react";
import { useNavigation, useSubmit, useActionData, useLoaderData } from "react-router";
import { v4 as uuidv4 } from "uuid";
import AccountForm from "./account-form";
import { PymtAccountFields, RouteHandlerResponse } from "../../services";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderResource } from "../../route-handlers/account-loader";
import { testAttributes } from "../../../../shared";


const AddAccount: FunctionComponent = () => {
    const [accountId, setAccountId] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountDetailLoaderResource, null>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // creating temporary id
        setAccountId(uuidv4());
    }, []);

    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        }
        else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else if (actionData?.type === "success" || loaderData.type === "success") {
            setErrorMessage("");
        }
    }, [actionData, loaderData]);

    const onAddedAccount = (data: PymtAccountFields) => {
        if (auth.userDetails.isAuthenticated) {
            const formData: any = {
                ...data,
                id: accountId,
            };

            submit(formData, { action: getFullPath("addPymAccount"), method: "post", encType: "application/json" });
        } else {
            setErrorMessage("you have been logged out. please (login)[/login] to add payment account");
        }
    };

    return (
        <>
            {
                errorMessage &&
                <article className="message is-danger" { ...testAttributes("add-payment-account-error-message") }>
                    <div className="message-body">
                        <ReactMarkdown children={ errorMessage } />
                    </div>
                </article>
            }

            {
                loaderData.type === "success" && !auth.readOnly &&

                <div className="columns">
                    <div className="column">
                        <AccountForm
                            key="add-account-form"
                            accountId={ accountId }
                            submitLabel={ navigation.state === "submitting" ? "Adding Account details..." : "Add" }
                            onSubmit={ onAddedAccount }
                            sourceTags={ loaderData.data.pymtAccountTags }
                            categoryTypes={ loaderData.data.categoryTypes }
                            currencyProfiles={ loaderData.data.currencyProfiles }
                        />
                    </div>
                </div>
            }

            { auth.readOnly &&
                <div className="columns">
                    <div className="column">
                        <span { ...testAttributes("add-payment-account-not-allowed") }>Not Allowed to add Payment Account</span>
                    </div></div>
            }

        </>
    );
};

export default AddAccount;

