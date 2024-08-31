import { FunctionComponent, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root";
import { TagsInput, Input, TextArea, DropDown, InputValidators } from "../../../../components";
import { ConfigResource, PymtAccountFields, PymtAccStatus } from "../../services";
import { faBank } from "@fortawesome/free-solid-svg-icons";



export interface AccountFormProps {
    onSubmit (account: PymtAccountFields): void;
    submitLabel: string;
    // how to set this value? if I collect values from displayed paymentAccounts, 
    // there are chances to missed the tags. 
    // if I set it as config type, I need to manage add/remove. tideous task.
    // may be I can allow user to load old tags and store it as settings and 
    // can setup a rest api to retrieve tags
    sourceTags: string[];
    categoryTypes: ConfigResource[];
    details?: PymtAccountFields;
    accountId: string;
}

const AccountForm: FunctionComponent<AccountFormProps> = (props) => {
    const [shortName, setShortName] = useState(props.details?.shortName || "");
    const [accountIdNum, setAccountIdNum] = useState(props.details?.accountIdNum || "");
    const [institutionName, setInstitutionName] = useState(props.details?.institutionName || "");
    const [description, setDescription] = useState(props.details?.description || "");
    const [tags, setTags] = useState(props.details?.tags || []);
    const [typeName, setTypeName] = useState(props.details?.typeName?.toString() || "");

    // how to set this value? if I collect values from displayed paymentAccounts, 
    // there are chances to missed the tags. 
    // if I set it as config type, I need to manage add/remove. tideous task.
    // may be I can allow user to load old tags and store it as settings and 
    // can setup a rest api to retrieve tags
    // const [sourceTagValues, setSourceTagValues] = useState<string[]>();

    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        const data: PymtAccountFields = {
            id: props.accountId,
            shortName,
            accountIdNum,
            institutionName,
            description,
            tags,
            typeName,
            typeId: "",
            auditDetails: { createdOn: "", updatedOn: "" },
            status: PymtAccStatus.Enable,
            dropdownTooltip: ""
        };
        props.onSubmit(data);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(getFullPath("pymtAccountsRoot"));
    };

    const accountTypes = useMemo(() => props.categoryTypes.map(ctg => ctg.name), [props.categoryTypes]);

    const validateName = InputValidators.nameValidator();

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
                                        minlength={ 2 }
                                        initialValue={ shortName }
                                        tooltip="This is a name that you can recognize the trascation. this will be displayed as payment account"
                                        onChange={ setShortName }
                                        required={ true }
                                        validate={ validateName }
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
                                        validate={ validateName }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column">
                                <div className="mr-4 pr-4">
                                    <Input
                                        id="account-name-number"
                                        label="Account Name / Number: "
                                        type="text"
                                        placeholder="Enter Account name / number"
                                        size={ 25 }
                                        maxlength={ 25 }
                                        initialValue={ accountIdNum }
                                        tooltip="The account you want to add. give full name of account. this is for you to recognise account details."
                                        onChange={ setAccountIdNum }
                                        validate={ validateName }
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
                                    required={ true }
                                    selectedItem={ typeName }
                                />
                            </div>
                            <div className="column">
                                <div className="ml-2 pl-2">
                                    <TagsInput
                                        id="xpns-tags"
                                        label="Tags: "
                                        defaultValue={ tags }
                                        sourceValues={ props.sourceTags }
                                        placeholder="Add Tags"
                                        onChange={ setTags }
                                        key={ "xpns-tags" }
                                        maxTags={ 10 }
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
                                    maxlength={ 150 }
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