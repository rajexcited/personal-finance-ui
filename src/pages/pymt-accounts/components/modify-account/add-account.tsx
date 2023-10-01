import { FunctionComponent, useState, useEffect } from "react";
import { useNavigation, useSubmit, useActionData } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import AccountForm from "./account-form";
import { PymtAccountFields } from "../../store";
import { LoadSpinner } from "../../../../components";
import { PAGE_URL } from "../../../navigation";
import ReactMarkdown from "react-markdown";


const AddAccount: FunctionComponent = () => {
    const [accountId, setAccountId] = useState('');
    const navigation = useNavigation();
    const submit = useSubmit();
    // for error
    const actionData: any = useActionData();

    useEffect(() => {
        // creating temporary id
        setAccountId(uuidv4());
    }, []);

    const onAddedAccount = (data: PymtAccountFields) => {
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
    };

    return (
        <>
            <LoadSpinner loading={ navigation.state !== "idle" } />

            {
                !!actionData && !!actionData.errorMessage &&
                <article className="message is-danger">
                    <div className="message-body">
                        <ReactMarkdown children={ actionData.errorMessage } />
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

