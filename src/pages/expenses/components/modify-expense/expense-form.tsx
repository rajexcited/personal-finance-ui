import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFullPath } from "../../../root/components/navigation";
import { faStore, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import {
    TagsInput,
    Calendar,
    DropDown,
    Input,
    TextArea,
    VerifyIndicator,
    DropDownItemType
} from "../../../../components";
import ExpenseBreakDown from "./expense-breakdown";
import { ConfigResource, ExpenseFields, ExpenseItemFields, ReceiptProps } from "../../services";
import UploadReceiptsModal from "./upload-receipts";
import { formatTimestamp, getLogger } from "../../../../services";


export interface ExpenseFormProps {
    submitLabel: string;
    expenseId: string;
    onSubmit (fields: ExpenseFields, formData: FormData): void;
    details?: ExpenseFields;
    categoryTypes: ConfigResource[];
    paymentAccounts: Map<string, string>;
    sourceTags: string[];
}

const fcLogger = getLogger("FC.ExpenseForm", null, null, "DEBUG");

const ExpenseForm: FunctionComponent<ExpenseFormProps> = (props) => {
    const [billName, setBillName] = useState(props.details?.billName || '');
    const [amount, setAmount] = useState(props.details?.amount || '');
    const [pymtAccounts, setPymtAccounts] = useState<DropDownItemType[]>([]);
    const [selectedPymtAccount, setSelectedPymtAccount] = useState<DropDownItemType>();
    const [description, setDescription] = useState(props.details?.description || '');
    const [purchasedDate, setPurchaseDate] = useState(props.details?.purchasedDate as Date || new Date());
    const [tags, setTags] = useState<string[]>(props.details?.tags || []);
    const [categories, setCategories] = useState<DropDownItemType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<DropDownItemType>();
    const [verifiedDateTime, setVerifiedDateTime] = useState(props.details?.verifiedTimestamp as Date | undefined);
    const [expenseItems, setExpenseItems] = useState<ExpenseItemFields[]>(props.details?.expenseItems || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.details?.receipts || []);
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        const logger = getLogger("FC.ExpenseForm.onSubmitHandler");

        const formData = new FormData();

        const datareceipts: ReceiptProps[] = receipts.map(rct => {
            if (rct.file) {
                logger.info("receipt id=", rct.id, ", added file to formdata =", rct.file);
                formData.append(rct.id, rct.file);
            }
            return { id: rct.id, name: rct.name, contentType: rct.contentType, expenseId: props.expenseId, url: rct.url };
        });

        const data: ExpenseFields = {
            id: props.expenseId,
            billName: billName,
            paymentAccountId: selectedPymtAccount?.id,
            paymentAccountName: selectedPymtAccount?.content,
            amount,
            description,
            purchasedDate,
            tags,
            verifiedTimestamp: verifiedDateTime,
            expenseItems,
            expenseCategoryId: selectedCategory?.id,
            expenseCategoryName: selectedCategory?.content,
            receipts: datareceipts,
            auditDetails: { createdOn: "", updatedOn: "" },
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
        const myCategories = props.categoryTypes.map(ctg => {
            const itm: DropDownItemType = {
                id: ctg.id || "configIdNeverUsed",
                content: ctg.name,
                tooltip: ctg.description
            };
            return itm;
        });
        setCategories(myCategories);
        logger.info("props.categoryTypes =", props.categoryTypes, ", myCategories =", myCategories, ", props.details?.expenseCategoryId =", props.details?.expenseCategoryId, ", props.details?.expenseCategoryName =", props.details?.expenseCategoryName);
        if (props.details?.expenseCategoryId) {
            const selectedCtg: DropDownItemType = {
                id: props.details.expenseCategoryId,
                content: props.details.expenseCategoryName || ""
            };
            setSelectedCategory(selectedCtg);
            logger.info("selectedCategory =", selectedCtg);
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
                                id="xpns-bill-name"
                                label="Bill Name: "
                                type="text"
                                placeholder="Enter Store name"
                                size={ 20 }
                                initialValue={ billName }
                                tooltip="It could be store name or online site. Have short name that you can recognize"
                                leftIcon={ faStore }
                                key={ "xpns-bill-name" }
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
                                id="xpns-amount"
                                label="Bill Amount: "
                                type="number"
                                placeholder="0.00"
                                min={ -10000000 }
                                max={ 10000000 }
                                initialValue={ amount }
                                leftIcon={ faDollarSign }
                                className="is-medium"
                                key={ "xpns-amount" }
                                onChange={ setAmount }
                                step={ 0.01 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="xpns-pymt-acc"
                                key={ "xpns-pymt-acc" }
                                label="Payment Account: "
                                items={ pymtAccounts }
                                onSelect={ (selected: DropDownItemType) => setSelectedPymtAccount(selected) }
                                selectedItem={ selectedPymtAccount }
                                defaultItem={ selectedPymtAccount }
                            />
                        </div>
                        <div className="column">
                            <DropDown
                                id="xpns-category"
                                label="Category: "
                                items={ categories }
                                key={ "xpns-category" }
                                onSelect={ (selected: DropDownItemType) => setSelectedCategory(selected) }
                                direction="down"
                                selectedItem={ selectedCategory }
                                defaultItem={ selectedCategory }
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
                                id="xpns-desc"
                                label="Description: "
                                rows={ 2 }
                                value={ description }
                                onChange={ setDescription }
                                key={ "xpns-desc" }
                                maxlength={ 150 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TagsInput
                                id="xpns-tags"
                                label="Tags: "
                                defaultValue={ tags }
                                placeholder="Add Tags"
                                onChange={ setTags }
                                key={ "xpns-tags" }
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
                                id="xpns-verify-indicator"
                                key={ "xpns-verify-indicator" }
                                labelPrefix="Expense "
                                onChange={ setVerifiedDateTime }
                                verifiedDateTime={ verifiedDateTime }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <UploadReceiptsModal
                                receipts={ receipts }
                                expenseId={ props.expenseId }
                                onChange={ setReceipts }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="my-1 py-1">
                                <Calendar
                                    key={ "xpns-purchase-date" }
                                    id="xpns-purchase-date"
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
                    <ExpenseBreakDown
                        categories={ categories }
                        key={ "xpns-breakdown" }
                        billname={ billName }
                        amount={ amount }
                        parentExpenseId={ props.expenseId }
                        expenseItems={ expenseItems }
                        onChange={ setExpenseItems }
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

export default ExpenseForm;