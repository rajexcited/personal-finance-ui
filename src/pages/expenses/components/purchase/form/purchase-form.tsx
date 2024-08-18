import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../../root";
import { faStore, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import {
    TagsInput,
    Calendar,
    DropDown,
    Input,
    TextArea,
    VerifyIndicator,
    DropDownItemType
} from "../../../../../components";
import { PurchaseBreakDown } from "./purchase-breakdown";
import { ConfigResource, PurchaseFields, PurchaseItemFields, formatTimestamp, getLogger, ReceiptProps, ExpenseBelongsTo } from "../../../services";
import { UploadReceiptsModal } from "../receipt/upload-receipts";



export interface PurchaseFormProps {
    submitLabel: string;
    purchaseId: string;
    onSubmit (fields: PurchaseFields, formData: FormData): void;
    details?: PurchaseFields;
    purchaseTypes: ConfigResource[];
    paymentAccounts: Map<string, string>;
    sourceTags: string[];
}

const fcLogger = getLogger("FC.PurchaseForm", null, null, "DEBUG");

export const PurchaseForm: FunctionComponent<PurchaseFormProps> = (props) => {
    const [billName, setBillName] = useState(props.details?.billName || '');
    const [amount, setAmount] = useState(props.details?.amount || '');
    const [pymtAccounts, setPymtAccounts] = useState<DropDownItemType[]>([]);
    const [selectedPymtAccount, setSelectedPymtAccount] = useState<DropDownItemType>();
    const [description, setDescription] = useState(props.details?.description || '');
    const [purchasedDate, setPurchaseDate] = useState(props.details?.purchasedDate as Date || new Date());
    const [tags, setTags] = useState<string[]>(props.details?.tags || []);
    const [dropdownPurchaseTypeItems, setDropdownPurchaseTypeItems] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPurchaseType, setSelectedDropdownPurchaseType] = useState<DropDownItemType>();
    const [verifiedDateTime, setVerifiedDateTime] = useState(props.details?.verifiedTimestamp as Date | undefined);
    const [items, setItems] = useState<PurchaseItemFields[]>(props.details?.items || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.details?.receipts || []);
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        const logger = getLogger("onSubmitHandler", fcLogger);

        const formData = new FormData();

        const datareceipts: ReceiptProps[] = receipts.map(rct => {
            if (rct.file) {
                logger.info("receipt id=", rct.id, ", added file to formdata =", rct.file);
                formData.append(rct.id, rct.file);
            }
            return { id: rct.id, name: rct.name, contentType: rct.contentType, purchaseId: props.purchaseId, url: rct.url };
        });

        const data: PurchaseFields = {
            id: props.purchaseId,
            billName: billName,
            paymentAccountId: selectedPymtAccount?.id,
            paymentAccountName: selectedPymtAccount?.content,
            amount,
            description,
            purchasedDate,
            tags,
            verifiedTimestamp: verifiedDateTime,
            items,
            purchaseTypeId: selectedDropdownPurchaseType?.id,
            purchaseTypeName: selectedDropdownPurchaseType?.content,
            receipts: datareceipts,
            auditDetails: { createdOn: "", updatedOn: "" },
            belongsTo: ExpenseBelongsTo.Purchase
        };

        Object.entries(data).forEach((entry) => {
            const key = entry[0];
            let value = entry[1];
            if (value instanceof Date) value = formatTimestamp(value);
            else if (typeof value === "object") value = JSON.stringify(value);
            logger.info("added to form, key=", key, ", value =", value);
            formData.append(key, value || "");
        });

        logger.info("data =", data);
        props.onSubmit(data, formData);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(getFullPath("expenseJournalRoot"));
    };

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        const myDropdownPurchaseTypeItems = props.purchaseTypes.map(ctg => {
            const itm: DropDownItemType = {
                id: ctg.id || "configIdNeverUsed",
                content: ctg.name,
                tooltip: ctg.description
            };
            return itm;
        });
        setDropdownPurchaseTypeItems(myDropdownPurchaseTypeItems);
        logger.info("props.purchaseTypes =", props.purchaseTypes, ", myDropdownPurchaseTypeItems =", myDropdownPurchaseTypeItems, ", props.details?.purchaseTypeId =", props.details?.purchaseTypeId, ", props.details?.purchaseTypeName =", props.details?.purchaseTypeName);
        if (props.details?.purchaseTypeId) {
            const selectedDropdownPurchaseType: DropDownItemType = {
                id: props.details.purchaseTypeId,
                content: props.details.purchaseTypeName || ""
            };
            setSelectedDropdownPurchaseType(selectedDropdownPurchaseType);
            logger.info("selectedDropdownPurchaseType =", selectedDropdownPurchaseType);
        }

        const myPymtAccounts: DropDownItemType[] = [];
        props.paymentAccounts.forEach((name, id) => {
            const itm: DropDownItemType = {
                id: id,
                content: name
            };
            myPymtAccounts.push(itm);
        });
        setPymtAccounts(myPymtAccounts);
        logger.info("props.paymentAccounts =", props.paymentAccounts, ", myPymtAccounts =", myPymtAccounts, ", props.details?.paymentAccountId =", props.details?.paymentAccountId, ", props.details?.paymentAccountName =", props.details?.paymentAccountName);
        if (props.details?.paymentAccountId) {
            const selectedPaymentAcc: DropDownItemType = {
                id: props.details.paymentAccountId,
                content: props.details.paymentAccountName || ""
            };
            setSelectedPymtAccount(selectedPaymentAcc);
            logger.info("selectedPymtAccount =", selectedPaymentAcc);
        }
        logger.info("props.sourceTags =", props.sourceTags);

    }, []);


    return (
        <form onSubmit={ onSubmitHandler }>
            <div className="columns">
                <div className="column">
                    <div className="columns">
                        <div className="column">
                            <Input
                                id="purchase-bill-name"
                                label="Bill Name: "
                                type="text"
                                placeholder="Enter Store name"
                                size={ 20 }
                                initialValue={ billName }
                                tooltip="It could be store name or online site. Have short name that you can recognize"
                                leftIcon={ faStore }
                                key={ "purchase-bill-name" }
                                onChange={ setBillName }
                                required={ true }
                                maxlength={ 50 }
                                minlength={ 2 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <Input
                                id="purchase-amount"
                                label="Bill Amount: "
                                type="number"
                                placeholder="0.00"
                                min={ -10000000 }
                                max={ 10000000 }
                                initialValue={ amount }
                                leftIcon={ faDollarSign }
                                className="is-medium"
                                key={ "purchase-amount" }
                                onChange={ setAmount }
                                step={ 0.01 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="purchase-pymt-acc"
                                key={ "purchase-pymt-acc" }
                                label="Payment Account: "
                                items={ pymtAccounts }
                                onSelect={ (selected: DropDownItemType) => setSelectedPymtAccount(selected) }
                                selectedItem={ selectedPymtAccount }
                                defaultItem={ selectedPymtAccount }
                            />
                        </div>
                        <div className="column">
                            <DropDown
                                id="purchase-type"
                                label="Purchase Type: "
                                items={ dropdownPurchaseTypeItems }
                                key={ "purchase-type" }
                                onSelect={ (selected: DropDownItemType) => setSelectedDropdownPurchaseType(selected) }
                                direction="down"
                                selectedItem={ selectedDropdownPurchaseType }
                                defaultItem={ selectedDropdownPurchaseType }
                            />

                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">

                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TextArea
                                id="purchase-desc"
                                label="Description: "
                                rows={ 2 }
                                value={ description }
                                onChange={ setDescription }
                                key={ "purchase-desc" }
                                maxlength={ 150 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TagsInput
                                id="purchase-tags"
                                label="Tags: "
                                defaultValue={ tags }
                                placeholder="Add Tags"
                                onChange={ setTags }
                                key={ "purchase-tags" }
                                sourceValues={ props.sourceTags }
                                maxTags={ 10 }
                            />
                        </div>
                    </div>
                </div>
                <div className="column is-one-third">
                    <div className="columns">
                        <div className="column">
                            <VerifyIndicator
                                id="purchase-verify-indicator"
                                key={ "purchase-verify-indicator" }
                                labelPrefix="Purchase "
                                onChange={ setVerifiedDateTime }
                                verifiedDateTime={ verifiedDateTime }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <UploadReceiptsModal
                                receipts={ receipts }
                                purchaseId={ props.purchaseId }
                                onChange={ setReceipts }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="my-1 py-1">
                                <Calendar
                                    key={ "purchase-purchase-date" }
                                    id="purchase-purchase-date"
                                    label="Purchased Date: "
                                    startDate={ purchasedDate }
                                    onSelect={ (range) => { setPurchaseDate((prev) => (range.start || prev)); } }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column">
                    <PurchaseBreakDown
                        dropdownPurchaseTypeItems={ dropdownPurchaseTypeItems }
                        key={ "purchase-breakdown" }
                        billname={ billName }
                        amount={ amount }
                        parentPurchaseId={ props.purchaseId }
                        items={ items }
                        onChange={ setItems }
                        sourceTags={ props.sourceTags }
                    />
                </div>
            </div>
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
        </form>
    );
};
