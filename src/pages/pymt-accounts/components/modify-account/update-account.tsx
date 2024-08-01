import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { PymtAccountFields } from "../../services";
import AccountForm from "./account-form";
import { getFullPath } from "../../../root";
import { useAuth } from "../../../auth";
import ReactMarkdown from "react-markdown";
import { PymtAccountDetailLoaderResource } from "../../route-handlers/account-loader";
import { RouteHandlerResponse } from "../../../../services";


const UpdateAccount: FunctionComponent = () => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const auth = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountDetailLoaderResource, null>;
    const actionData = useActionData() as RouteHandlerResponse<null, any> | null;


    useEffect(() => {
        if (loaderData.type === "error") {
            setErrorMessage(loaderData.errorMessage);
        } else if (actionData?.type === "error") {
            setErrorMessage(actionData.errorMessage);
        } else if (loaderData.type === "success" || actionData?.type === "success") {
            setErrorMessage("");
        }
    }, [actionData, loaderData]);

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

