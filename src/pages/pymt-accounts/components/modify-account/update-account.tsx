import { FunctionComponent, useContext, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PymtAccountFields } from "../../store";
import { LoadSpinner } from "../../../../components";
import AccountForm from "./account-form";


const UpdateAccount: FunctionComponent = () => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const actionData: any = useActionData();
    const accountDetails = useLoaderData() as PymtAccountFields;

    const onUpdateAccount = (data: PymtAccountFields) => {
        const formData: any = { ...data };
        submit(formData);
    };

    return (
        <>
            <LoadSpinner loading={ navigation.state === "submitting" } />
            {
                !!actionData && !!actionData.errorMessage &&
                <article className="message is-danger">
                    <div className="message-body">
                        { actionData.errorMessage }
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
                    />
                </div>
            </div>
        </>
    );

};

export default UpdateAccount;

