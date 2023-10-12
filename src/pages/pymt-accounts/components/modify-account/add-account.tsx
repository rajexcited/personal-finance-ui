import { FunctionComponent, useState, useEffect } from "react";
import { useNavigation, useSubmit, useActionData } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import AccountForm from "./account-form";
import { PymtAccountFields } from "../../services";
import { PAGE_URL } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";


const AddAccount: FunctionComponent = () => {
    const [accountId, setAccountId] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    // for error
    const actionData: any = useActionData();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // creating temporary id
        setAccountId(uuidv4());
    }, []);

    useEffect(() => {
        if (actionData?.errorMessage && actionData.errorMessage !== errorMessage)
            setErrorMessage(actionData.errorMessage);
    }, [errorMessage, actionData?.errorMessage]);

    const onAddedAccount = (data: PymtAccountFields) => {
        if (auth.isAuthenticated) {
            const formData: any = {
                accountId,
                shortName: data.shortName,
                institutionName: data.institutionName,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                typeName: data.typeName,
                tags: data.tags,
                description: data.description,
                icon: data.icon
            };

            submit(formData, { action: PAGE_URL.addPymAccount.fullUrl, method: "post" });
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
                        accountName=""
                        accountNumber=""
                        description=""
                        institutionName=""
                        shortName=""
                        tags=""
                        typeName=""
                    />
                </div>
            </div>

        </>
    );
};

export default AddAccount;

