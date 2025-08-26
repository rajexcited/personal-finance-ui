import { FunctionComponent, useState } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router";
import { AccountItemCard } from "./account-item-view";
import { PymtAccountFields, PymtAccStatus, RouteHandlerResponse } from "../../services";
import { Animated, ConfirmDialog } from "../../../../components";
import { getFullPath } from "../../../root";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../../auth";
import { testAttributes } from "../../../../shared";


const AccountList: FunctionComponent = () => {
    const loaderData = useLoaderData() as RouteHandlerResponse<PymtAccountFields[], null>;
    const actionData = useActionData() as RouteHandlerResponse<any, null> | null;
    const [deletingAccountId, setDeletingAccountId] = useState("");
    const submit = useSubmit();
    const auth = useAuth();

    const onDeleteConfirmHandler = () => {
        if (loaderData.type === "success" && !auth.readOnly) {
            const deletingPymtAcc = loaderData.data.find(acc => acc.id === deletingAccountId);
            if (deletingPymtAcc && deletingPymtAcc.status === PymtAccStatus.Enable) {
                const data: any = { ...deletingPymtAcc };
                submit(data, { action: getFullPath("pymtAccountsRoot"), method: "delete", encType: "application/json" });
                setDeletingAccountId("");
            }
        }
    };

    const pymtAccList = loaderData.type === "success" ? loaderData.data : [];
    const errorMessage = loaderData.type === "error" ? loaderData.errorMessage : actionData?.type === "error" ? actionData.errorMessage : null;

    return (
        <section className="container" { ...testAttributes("payment-account-section") } >
            {
                errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp" scrollBeforePlayIn={ true }>
                    <div className="columns is-centered" { ...testAttributes("payment-account-list-error-message") }>
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
                <p className="title" { ...testAttributes("no-payment-account-message") } >There are no accounts</p>
            }
            {
                pymtAccList.map(acc =>
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
