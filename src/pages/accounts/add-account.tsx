import { FunctionComponent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../page-url";
import { AccountFields } from "./accounts-type";
import { v4 as uuidv4 } from "uuid";
import AccountForm from "./account-form";
import { AccountContext } from "./account-context";
import accountList from "./account-list";


export interface AddAccountProps {
}

const AddAccount: FunctionComponent<AddAccountProps> = () => {
    const accounts = useContext(AccountContext);
    const navigate = useNavigate();
    const [accountId, setAccountId] = useState(uuidv4());

    const onAddedAccount = (data: AccountFields) => {
        accounts.push(data);
        setTimeout(() => {
            navigate(PAGE_URL.accounts.fullUrl);
        }, 300);
    };

    return (
        <AccountContext.Provider value={ accounts }>
            <div className="columns">
                <div className="column">
                    <AccountForm
                        key="add-account-form"
                        accountId={ accountId }
                        submitLabel="Add"
                        onSubmit={ onAddedAccount }
                        accountName=""
                        accountNumber=""
                        description=""
                        institutionName=""
                        shortName=""
                        tags=""
                    />
                </div>
            </div>
        </AccountContext.Provider>
    );
};

export default AddAccount;