import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PymtAccountFields } from "../../services";
import AccountForm from "./account-form";
import { PAGE_URL } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";


const UpdateAccount: FunctionComponent = () => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData: any = useActionData();
    const accountDetails = useLoaderData() as PymtAccountFields;
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (actionData?.errorMessage && actionData.errorMessage !== errorMessage)
            setErrorMessage(actionData.errorMessage);
    }, [errorMessage, actionData?.errorMessage]);

    const onUpdateAccount = (data: PymtAccountFields) => {
        if (auth.isAuthenticated) {
            const formData: any = { ...data };
            submit(formData, { action: PAGE_URL.pymtAccountsRoot.fullUrl, method: "post" });
        } else {
            setErrorMessage("you have been logged out. please (login)[/login] to add payment account");
        }
    };


    return (
        <>
            {
                errorMessage &&
                <article className="message is-danger">
                    <div className="message-body">
                        <ReactMarkdown children={ errorMessage } />
                    </div>
                </article>
            }
            <div className="columns">
                <div className="column">
                    <AccountForm
                        key="update-account-form"
                        accountId={ accountDetails.accountId }
                        submitLabel={ navigation.state === "submitting" ? "Saving Account details..." : "Update" }
                        onSubmit={ onUpdateAccount }
                        accountName={ accountDetails.accountName }
                        accountNumber={ accountDetails.accountNumber }
                        description={ accountDetails.description }
                        institutionName={ accountDetails.institutionName }
                        shortName={ accountDetails.shortName }
                        tags={ accountDetails.tags }
                        typeName={ accountDetails.typeName }
                    />
                </div>
            </div>
        </>
    );

};

export default UpdateAccount;

