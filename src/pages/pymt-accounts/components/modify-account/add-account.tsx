import { FunctionComponent, useState, useEffect } from "react";
import { useNavigation, useSubmit, useActionData, useLoaderData } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import AccountForm from "./account-form";
import { PymtAccountFields } from "../../services";
import { PAGE_URL } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderResource } from "../../route-handlers/account-loader";
import { RouteHandlerResponse } from "../../../../services";


const AddAccount: FunctionComponent = () => {
    const [accountId, setAccountId] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData = useActionData() as RouteHandlerResponse<any> | null;
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountDetailLoaderResource>;
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // creating temporary id
        setAccountId(uuidv4());
    }, []);

    useEffect(() => {
        if (actionData?.type === "error" && actionData.errorMessage !== errorMessage) {
            setErrorMessage(actionData.errorMessage);
        }
        else if (loaderData.type === "error" && loaderData.errorMessage !== errorMessage) {
            setErrorMessage(loaderData.errorMessage);
        }
    }, [errorMessage, actionData, loaderData]);

    const onAddedAccount = (data: PymtAccountFields) => {
        if (auth.userDetails.isAuthenticated) {
            const formData: any = {
                ...data,
                id: accountId,
            };

            submit(formData, { action: PAGE_URL.addPymAccount.fullUrl, method: "post", encType: "application/json" });
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
                        key="add-account-form"
                        accountId={ accountId }
                        submitLabel={ navigation.state === "submitting" ? "Adding Account details..." : "Add" }
                        onSubmit={ onAddedAccount }
                        sourceTags={ loaderData.data.pymtAccountTags }
                        categoryTypes={ loaderData.data.categoryTypes }
                    />
                </div>
            </div>

        </>
    );
};

export default AddAccount;

