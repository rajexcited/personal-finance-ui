import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root";
import { TagsInput, Input, TextArea, DropDown, InputValidators, DropDownItemType, CurrencySymbol } from "../../../../components";
import { ConfigResource, PymtAccountFields, PymtAccStatus, getLogger } from "../../services";
import { faBank } from "@fortawesome/free-solid-svg-icons";
import { CurrencyProfileResource } from "../../../settings/services";
import { testAttributes } from "../../../../shared";



export interface AccountFormProps {
    onSubmit (account: PymtAccountFields): void;
    submitLabel: string;
    sourceTags: string[];
    categoryTypes: ConfigResource[];
    details?: PymtAccountFields;
    accountId: string;
    currencyProfiles: CurrencyProfileResource[];
}

const fcLogger = getLogger("FC.AccountForm", null, null, "DISABLED");

const AccountForm: FunctionComponent<AccountFormProps> = (props) => {
    const [shortName, setShortName] = useState(props.details?.shortName || "");
    const [accountIdNum, setAccountIdNum] = useState(props.details?.accountIdNum || "");
    const [institutionName, setInstitutionName] = useState(props.details?.institutionName || "");
    const [description, setDescription] = useState(props.details?.description || "");
    const [tags, setTags] = useState(props.details?.tags || []);
    const [dropdownAccTypes, setDropdownAccTypes] = useState<DropDownItemType[]>([]);
    const [selectedDropdownAccType, setSelectedDropdownAccType] = useState<DropDownItemType>();
    const [defaultCurrencyProfile, setDefaultCurrencyProfile] = useState<CurrencyProfileResource>(props.currencyProfiles[0]);
    const navigate = useNavigate();

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);

        const ddAccTypeList: DropDownItemType[] = props.categoryTypes.map((typCfg) => {
            return {
                id: typCfg.id,
                content: typCfg.name,
                tooltip: typCfg.description
            };
        });
        setDropdownAccTypes(ddAccTypeList);

        if (props.details?.typeId && props.details.typeName) {
            let mySelectedType = ddAccTypeList.find(ddTyp => (ddTyp.id === props.details?.typeId && ddTyp.content === props.details.typeName));
            if (!mySelectedType) {
                mySelectedType = {
                    id: props.details.typeId,
                    content: props.details.typeName
                };
            }
            logger.debug("mySelectedType =", mySelectedType);
            setSelectedDropdownAccType(mySelectedType);
        }

    }, []);


    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = event => {
        const logger = getLogger("onSubmitHandler", fcLogger);
        event.preventDefault();

        if (!selectedDropdownAccType) {
            // this never gets called because it is required, but due to compilation added if condition
            logger.debug("selectedDropdownAccType is null");
            throw new Error("Pymt acc Type is not selected");
        }

        const data: PymtAccountFields = {
            id: props.accountId,
            shortName,
            accountIdNum,
            institutionName,
            description,
            tags,
            typeName: selectedDropdownAccType.content,
            typeId: selectedDropdownAccType.id,
            auditDetails: { createdOn: "", updatedOn: "" },
            status: PymtAccStatus.Enable,
            dropdownTooltip: "",
            currencyProfileId: defaultCurrencyProfile.id
        };
        props.onSubmit(data);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(getFullPath("pymtAccountsRoot"));
    };

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
                            <div className="column is-narrow">
                                <CurrencySymbol
                                    countryCode={ defaultCurrencyProfile.country.code }
                                    countryName={ defaultCurrencyProfile.country.name }
                                    currencyCode={ defaultCurrencyProfile.currency.code }
                                    currencyName={ defaultCurrencyProfile.currency.name }
                                />
                            </div>
                            <div className="column">
                                <div className="mr-4 pr-4">
                                    <Input
                                        id="account-number"
                                        label="Account Number: "
                                        type="text"
                                        placeholder="Enter Account number"
                                        size={ 25 }
                                        minlength={ 4 }
                                        maxlength={ 25 }
                                        required={ true }
                                        initialValue={ accountIdNum }
                                        tooltip="if you are uncofortable entering full account number, add last 4 digits so verification can be made easy."
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
                                    items={ dropdownAccTypes }
                                    onSelect={ (selected: DropDownItemType) => setSelectedDropdownAccType(selected) }
                                    direction="down"
                                    required={ true }
                                    selectedItem={ selectedDropdownAccType }
                                />
                            </div>
                            <div className="column">
                                <div className="ml-2 pl-2">
                                    <TagsInput
                                        id="pymt-acc-tags"
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
                            <div className="buttons is-centered is-display-mobile">
                                <button className="button is-dark is-large" type="submit" { ...testAttributes("submit-payment-account") }>
                                    <span className="px-2-label">
                                        { props.submitLabel }
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="column">
                            <div className="buttons">
                                <button className="button is-light" type="button" onClick={ onCancelHandler } { ...testAttributes("cancel-payment-account") }>
                                    <span className="px-2-label">
                                        Cancel
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div className="column">
                            <div className="buttons is-centered is-hidden-mobile">
                                <button className="button is-dark is-medium" type="submit" { ...testAttributes("submit-payment-account") }>
                                    <span className="px-2-label">
                                        { props.submitLabel }
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </form>
        </div>
    );
};

export default AccountForm;