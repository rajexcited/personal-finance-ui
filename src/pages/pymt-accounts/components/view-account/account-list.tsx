import { FunctionComponent } from "react";
import AccountItemCard from "./account-item-view";
import { PymtAccountFields } from "../../store";
import { Await, useLoaderData } from "react-router-dom";



interface AccountListProps { }

const AccountList: FunctionComponent<AccountListProps> = (props) => {
    const pymtAccList = useLoaderData() as PymtAccountFields[];

    return (
        <section className="container">
            {
                !pymtAccList.length &&
                <p className="title">There are no accounts</p>
            }
            { pymtAccList.map(acc =>
                <AccountItemCard
                    key={ acc.accountId + "viewcard" }
                    id={ acc.accountId + "viewcard" }
                    details={ acc }
                />)
            }
        </section>
    );
};

export default AccountList;
