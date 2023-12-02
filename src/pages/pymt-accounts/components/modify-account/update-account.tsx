import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PymtAccountFields } from "../../services";
import AccountForm from "./account-form";
import { PAGE_URL } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderType } from "../../route-handlers/account-loader";


const UpdateAccount: FunctionComponent = () => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData: any = useActionData();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const loaderData = useLoaderData() as PymtAccountDetailLoaderType;


    useEffect(() => {
        if (actionData?.errorMessage && actionData.errorMessage !== errorMessage)
            setErrorMessage(actionData.errorMessage);
    }, [errorMessage, actionData?.errorMessage]);

    const onUpdateAccount = (data: PymtAccountFields) => {
        if (auth.isAuthenticated) {
            const formData: any = { ...data };
            submit(formData, { action: PAGE_URL.updatePymAccount.fullUrl, method: "post" });
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
                    { loaderData.pymtAccountDetail &&
                        <AccountForm
                            key="update-account-form"
                            accountId={ loaderData.pymtAccountDetail.accountId }
                            submitLabel={ navigation.state === "submitting" ? "Saving Account details..." : "Update" }
                            onSubmit={ onUpdateAccount }
                            details={ loaderData.pymtAccountDetail }
                            sourceTags={ loaderData.pymtAccountTags }
                            categoryTypes={ loaderData.categoryTypes }
                        />
                    }
                </div>
            </div>
        </>
    );

};

export default UpdateAccount;

