import { FunctionComponent, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../../navigation";
import { PymtAccountFields } from "../../store";
import { TagsInput, Input, InputValidateResponse, TextArea, DropDown } from "../../../../components";
import { PymtAccountTypeService, ConfigType } from "../../services";
import { faBank } from "@fortawesome/free-solid-svg-icons";


const accountTypeService = PymtAccountTypeService();

export interface AccountFormProps extends PymtAccountFields {
    onSubmit (account: PymtAccountFields): void;
    submitLabel: string;
}

const AccountForm: FunctionComponent<AccountFormProps> = (props) => {
    const [shortName, setShortName] = useState(props.shortName);
    const [accountName, setAccountName] = useState(props.accountName);
    const [institutionName, setInstitutionName] = useState(props.institutionName);
    const [accountNumber, setAccountNumber] = useState(props.accountNumber);
    const [description, setDescription] = useState(props.description);
    const [tags, setTags] = useState(props.tags);
    const [typeName, setTypeName] = useState(props.typeName?.toString() || "");
    const [accountTypeMap, setAccountTypeMap] = useState(new Map<string, ConfigType>());
    const [sourceTags, setSourceTags] = useState<string[]>();

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const list = await accountTypeService.getAccountTypes();
            const map = new Map();
            list.forEach(item => map.set(item.name, item));
            setAccountTypeMap(map);
        })();

    }, []);

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = event => {
        // const onSubmitHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        // const acctype = AccountType[type as keyof typeof AccountType];
        const data: PymtAccountFields = {
            ...props,
            shortName,
            accountName,
            institutionName,
            accountNumber,
            description,
            tags,
            typeName
        };
        props.onSubmit(data);
        // return data;
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(PAGE_URL.pymtAccountsRoot.fullUrl);
    };

    const accountTypes = [];
    for (let acctype of accountTypeMap.values()) {
        accountTypes.push(acctype.name);
    }

    const nameValidator = useCallback((inputValue: string): InputValidateResponse => {
        const regex = /^[\w\d\s@!'_\.,\$\*-]+$/;
        const isValid = regex.test(inputValue);
        return {
            isValid,
            errorMessage: "allow characters are alpha-numeric, digits, dash, underscore, comma, single quote, $, *, @ and !"
        };
    }, []);

    return (
        <div>
            <form onSubmit={ onSubmitHandler } >
                <div className="columns">
                    <div className="column">
                        <div className="columns">
                            <div className="column">
                                <div className="mr-4 pr-4">
                                    <Input
                                        id="account-short-name"
                                        label="Short Name: "
                                        type="text"
                                        placeholder="Enter Short name"
                                        size={ 20 }
                                        maxlength={ 20 }
                                        initialValue={ shortName }
                                        tooltip="This is a name that you can recognize the trascation. this will be displayed as payment account"
                                        onChange={ setShortName }
                                        required={ true }
                                        validate={ nameValidator }
                                    />
                                </div>
                            </div>
                            <div className="column">
                                <div className="ml-2 pl-2">
                                    <Input
                                        id="account-instritution-name"
                                        label="Institution/Bank Name: "
                                        type="text"
                                        leftIcon={ faBank }
                                        placeholder="Enter Institution / Bank Name"
                                        size={ 25 }
                                        maxlength={ 25 }
                                        initialValue={ institutionName }
                                        tooltip="Name of the financial institution where this account belongs to. It could be bank name, credit card institution, loaner, etc. for example, Bank of America, Chase"
                                        onChange={ setInstitutionName }
                                        validate={ nameValidator }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="mr-4 pr-4">
                                    <Input
                                        id="account-name"
                                        label="Account Name: "
                                        type="text"
                                        placeholder="Enter Account name"
                                        size={ 50 }
                                        maxlength={ 50 }
                                        initialValue={ accountName }
                                        tooltip="The account you want to add. give full name of account"
                                        onChange={ setAccountName }
                                        required={ true }
                                        validate={ nameValidator }
                                    />
                                </div>
                            </div>
                            <div className="column">
                                <div className="ml-2 pl-2">
                                    <Input
                                        id="account-number"
                                        label="Account Number: "
                                        type="text"
                                        placeholder="Enter Account number"
                                        size={ 25 }
                                        maxlength={ 25 }
                                        initialValue={ accountNumber }
                                        onChange={ setAccountNumber }
                                        validate={ nameValidator }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <DropDown
                                    id="account-type"
                                    label="Account Type: "
                                    items={ accountTypes }
                                    onSelect={ (selected: string) => setTypeName(selected) }
                                    direction="down"
                                    selectedItem={ typeName }
                                />
                            </div>
                            <div className="column">
                                <div className="ml-2 pl-2">
                                    <TagsInput
                                        id="xpns-tags"
                                        label="Tags: "
                                        value={ tags || "lomesh,pappa" }
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
            </form>
        </div>
    );
};

export default AccountForm;