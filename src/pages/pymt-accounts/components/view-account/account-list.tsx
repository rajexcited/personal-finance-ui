import { FunctionComponent } from "react";
import AccountItemCard from "./account-item-view";
import { PymtAccountFields } from "../../store";
import { useLoaderData } from "react-router-dom";



interface AccountListProps { }

const AccountList: FunctionComponent<AccountListProps> = (props) => {
    const loaderData = useLoaderData();

    console.log("loaderData: ", loaderData);
    let pymtAccList: PymtAccountFields[] = [];
    if (Array.isArray(loaderData)) {
        pymtAccList = loaderData as PymtAccountFields[];
    }


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
