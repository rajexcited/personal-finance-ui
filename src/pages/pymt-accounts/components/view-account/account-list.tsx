import { FunctionComponent, useState } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import AccountItemCard from "./account-item-view";
import { PymtAccountFields } from "../../services";
import { Animated, ConfirmDialog } from "../../../../components";
import { PAGE_URL } from "../../../root";
import ReactMarkdown from "react-markdown";
import { RouteHandlerResponse } from "../../../../services";


const AccountList: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountFields[], null>;
    const actionData = useActionData() as RouteHandlerResponse<any, null> | null;
    const [deletingAccountId, setDeletingAccountId] = useState("");
    const submit = useSubmit();

    const onDeleteConfirmHandler = () => {
        if (loaderData.type === "success") {
            const deletingPymtAcc = loaderData.data.find(acc => acc.id === deletingAccountId);
            const data: any = { ...deletingPymtAcc };
            submit(data, { action: PAGE_URL.pymtAccountsRoot.fullUrl, method: "delete", encType: "application/json" });
            setDeletingAccountId("");
        }
    };

    const pymtAccList = loaderData.type === "success" ? loaderData.data : [];
    const errorMessage = loaderData.type === "error" ? loaderData.errorMessage : actionData?.type === "error" ? actionData.errorMessage : null;

    return (
        <section className="container">
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp">
                    <div className="columns is-centered">
                        <div className="column is-four-fifths">
                            <article className="message is-danger mb-3">
                                <div className="message-body">
                                    <ReactMarkdown children={ errorMessage } />
                                </div>
                            </article>
                        </div>
                    </div>
                </Animated>
            }
            {
                !errorMessage && !pymtAccList.length &&
                <p className="title">There are no accounts</p>
            }
            { pymtAccList.map(acc =>
                <AccountItemCard
                    key={ acc.id + "viewcard" }
                    id={ acc.id + "viewcard" }
                    details={ acc }
                    onDeleteRequest={ setDeletingAccountId }
                />)
            }
            <ConfirmDialog
                id="delete-pymt-acc-confirm-dialog"
                content="Are you sure that you want to delete payment account?"
                title="Remove Payment Account"
                open={ !!deletingAccountId }
                onConfirm={ onDeleteConfirmHandler }
                onCancel={ () => setDeletingAccountId("") }
                yesButtonClassname="is-danger"
            />
        </section>
    );
};

export default AccountList;
