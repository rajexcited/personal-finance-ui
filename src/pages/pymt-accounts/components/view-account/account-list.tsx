import { FunctionComponent, useState, useEffect } from "react";
import { useActionData, useLoaderData, useSubmit } from "react-router-dom";
import AccountItemCard from "./account-item-view";
import { PymtAccountFields } from "../../services";
import { Animated, ConfirmDialog } from "../../../../components";
import { PAGE_URL } from "../../../root";
import ReactMarkdown from "react-markdown";


const AccountList: FunctionComponent = () => {
    const pymtAccList = useLoaderData() as PymtAccountFields[];
    const actionData = useActionData() as { errorMessage: string; };
    const [deletingAccountId, setDeletingAccountId] = useState("");
    const submit = useSubmit();

    const onDeleteConfirmHandler = () => {
        const deletingPymtAcc = pymtAccList.find(acc => acc.accountId === deletingAccountId);
        // setPymtAccList(pymtAccList => pymtAccList.filter(acc => acc !== deletingPymtAcc));
        const data: any = { ...deletingPymtAcc };
        submit(data, { action: PAGE_URL.pymtAccountsRoot.fullUrl, method: "delete" });
        setDeletingAccountId("");
    };

    return (
        <section className="container">
            {
                actionData && actionData.errorMessage &&
                <Animated animateOnMount={ true } isPlayIn={ true } animatedIn="fadeInDown" animatedOut="fadeOutUp">
                    <div className="columns is-centered">
                        <div className="column is-four-fifths">
                            <article className="message is-danger mb-3">
                                <div className="message-body">
                                    <ReactMarkdown children={ actionData.errorMessage } />
                                </div>
                            </article>
                        </div>
                    </div>
                </Animated>
            }
            {
                !pymtAccList.length &&
                <p className="title">There are no accounts</p>
            }
            { pymtAccList.map(acc =>
                <AccountItemCard
                    key={ acc.accountId + "viewcard" }
                    id={ acc.accountId + "viewcard" }
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
