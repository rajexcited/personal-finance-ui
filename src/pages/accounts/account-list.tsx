import { FunctionComponent, useState, useContext, useEffect } from "react";
import { AccountFields, AccountType } from "./accounts-type";
import AccountItemCard from "./account-item-view";
import { AccountContext } from "./account-context";


const AccountList: FunctionComponent = () => {
    const accounts = useContext(AccountContext);
    const [accountList, setAccountList] = useState<AccountFields[]>(accounts);

    useEffect(() => {
        const list: AccountFields[] = [
            {
                accountId: "id1",
                accountName: "name1",
                accountNumber: "number1",
                description: "description 1",
                institutionName: "bank",
                shortName: "bn",
                tags: "hysa",
                type: AccountType.savings
            },
            {
                accountId: "id2",
                accountName: "name2",
                accountNumber: "number2",
                description: "description 2",
                institutionName: "credit card",
                shortName: "cc",
                tags: "cc,grocery",
                type: AccountType.creditCard
            }
        ];

        if (accounts.length == 0) {
            console.log("setting list");
            setAccountList([...list]);
            accounts.push(...list);
        }

    }, []);

    return (
        <AccountContext.Provider value={ accounts }>
            <section className="container">
                { accountList.map(acc =>
                    <AccountItemCard
                        key={ acc.accountId + "viewcard" }
                        id={ acc.accountId + "viewcard" }
                        details={ acc }
                    />)
                }
            </section>
        </AccountContext.Provider>
    );
};

export default AccountList;