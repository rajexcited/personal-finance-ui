import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PymtAccountFields } from "../../services";
import AccountForm from "./account-form";
import { PAGE_URL } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderResource } from "../../route-handlers/account-loader";
import { RouteHandlerResponse } from "../../../../services";


const UpdateAccount: FunctionComponent = () => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountDetailLoaderResource>;
    const actionData = useActionData() as RouteHandlerResponse<any> | null;


    useEffect(() => {
        if (actionData?.type === "error" && actionData.errorMessage !== errorMessage) {
            setErrorMessage(actionData.errorMessage);
        } else if (loaderData.type === "error" && loaderData.errorMessage !== errorMessage) {
            setErrorMessage(loaderData.errorMessage);
        }
    }, [errorMessage, actionData, loaderData]);

    const onUpdateAccount = (data: PymtAccountFields) => {
        if (auth.userDetails.isAuthenticated) {
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
                    { loaderData.type === "success" && loaderData.data.pymtAccountDetail &&
                        <AccountForm
                            key="update-account-form"
                            accountId={ loaderData.data.pymtAccountDetail.id }
                            submitLabel={ navigation.state === "submitting" ? "Saving Account details..." : "Update" }
                            onSubmit={ onUpdateAccount }
                            details={ loaderData.data.pymtAccountDetail }
                            sourceTags={ loaderData.data.pymtAccountTags }
                            categoryTypes={ loaderData.data.categoryTypes }
                        />
                    }
                </div>
            </div>
        </>
    );

};

export default UpdateAccount;

