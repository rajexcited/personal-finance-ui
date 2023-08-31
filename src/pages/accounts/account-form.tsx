import { FunctionComponent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../page-url";
import { AccountFields, AccountType } from "./accounts-type";
import Input from "../../components/input";
import TextArea from "../../components/textarea";
import TagsInput from "../../components/TagsInput";
import DropDown from "../../components/dropdown";
import { faBank } from "@fortawesome/free-solid-svg-icons";

const accountTypes = Object.keys(AccountType).filter(k => isNaN(Number(k)));

export interface AccountFormProps extends AccountFields {
    onSubmit (account: AccountFields): void;
    submitLabel: string;
}

const AccountForm: FunctionComponent<AccountFormProps> = (props) => {
    const [shortName, setShortName] = useState(props.shortName);
    const [accountName, setAccountName] = useState(props.accountName);
    const [institutionName, setInstitutionName] = useState(props.institutionName);
    const [accountNumber, setAccountNumber] = useState(props.accountNumber);
    const [description, setDescription] = useState(props.description);
    const [tags, setTags] = useState(props.tags);
    const [type, setType] = useState(props.type?.toString() || "");
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        const acctype = AccountType[type as keyof typeof AccountType];
        const data = {
            ...props,
            shortName,
            accountName,
            institutionName,
            accountNumber,
            description,
            tags,
            type: acctype
        };
        props.onSubmit(data);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(PAGE_URL.accounts.fullUrl);
    };

    return (
        <form onSubmit={ onSubmitHandler }>
            <div className="columns">
                <div className="column">
                    <div className="columns">
                        <div className="column">
                            <div className="mr-4 pr-4">
                                <Input
                                    id="account-short-name"
                                    key={ "account-short-name" }
                                    label="Short Name: "
                                    type="text"
                                    placeholder="Enter Short name"
                                    size={ 20 }
                                    initialValue={ shortName }
                                    tooltip="This is a name that you can recognize the trascation. this will be displayed everywhere"
                                    onChange={ setShortName }
                                    required={ true }
                                />
                            </div>
                        </div>
                        <div className="column">
                            <div className="ml-2 pl-2">
                                <Input
                                    id="account-instritution-name"
                                    key={ "account-institution-name" }
                                    label="Institution Name: "
                                    type="text"
                                    leftIcon={ faBank }
                                    placeholder="Enter Institution Name"
                                    size={ 25 }
                                    initialValue={ institutionName }
                                    tooltip="name of the financial institution where you have open the account. e.g. Bank of America"
                                    onChange={ setInstitutionName }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="mr-4 pr-4">
                                <Input
                                    id="account-name"
                                    key={ "account-name" }
                                    label="Account Name: "
                                    type="text"
                                    placeholder="Enter Account name"
                                    size={ 50 }
                                    initialValue={ accountName }
                                    tooltip="The account you want to add. give full name of account"
                                    onChange={ setAccountName }
                                    required={ true }
                                />
                            </div>
                        </div>
                        <div className="column">
                            <div className="ml-2 pl-2">
                                <Input
                                    id="account-number"
                                    key={ "account-number" }
                                    label="Account Number: "
                                    type="text"
                                    placeholder="Enter Account number"
                                    size={ 25 }
                                    initialValue={ accountNumber }
                                    onChange={ setAccountNumber }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="account-type"
                                key={ "account-type" }
                                label="Account Type: "
                                items={ accountTypes }
                                onSelect={ setType }
                                direction="down"
                            />
                        </div>
                        <div className="column">
                            <div className="ml-2 pl-2">
                                <TagsInput
                                    id="xpns-tags"
                                    label="Tags: "
                                    value={ tags }
                                    placeholder="Add Tags"
                                    onChange={ setTags }
                                    key={ "xpns-tags" }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TextArea
                                id="account-desc"
                                key={ "account-desc" }
                                label="Description: "
                                rows={ 2 }
                                value={ description }
                                onChange={ setDescription }
                            />
                        </div>
                    </div>
                </div>
            </div>
            <footer>
                <div className="columns">
                    <div className="column">
                        <div className="buttons">
                            <button className="button is-light" type="button" onClick={ onCancelHandler }> Cancel </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons has-addons is-centered">
                            <button className="button is-dark is-medium" type="submit"> { props.submitLabel } </button>
                        </div>
                    </div>
                </div>
            </footer>
        </form >
    );
};

export default AccountForm;