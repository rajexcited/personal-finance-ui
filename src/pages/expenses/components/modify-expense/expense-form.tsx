import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../../root/components/navigation";
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
import { ConfigType, ExpenseFields, ExpenseItemFields, ReceiptProps } from "../../services";
import UploadReceiptsModal from "./upload-receipts";


export interface ExpenseFormProps {
    submitLabel: string;
    expenseId: string;
    onSubmit (fields: ExpenseFields, formData: FormData): void;
    details?: ExpenseFields;
    categoryTypes: ConfigType[];
    paymentAccounts: Map<string, string>;
    sourceTags: string[];
}

const ExpenseForm: FunctionComponent<ExpenseFormProps> = (props) => {
    const [billName, setBillName] = useState(props.details?.billname || '');
    const [amount, setAmount] = useState(props.details?.amount || '');
    const [pymtAccounts, setPymtAccounts] = useState<DropDownItemType[]>([]);
    const [selectedPymtAccount, setSelectedPymtAccount] = useState<DropDownItemType>();
    const [description, setDescription] = useState(props.details?.description || '');
    const [purchasedDate, setPurchaseDate] = useState(props.details?.purchasedDate || new Date());
    const [tags, setTags] = useState(props.details?.tags || '');
    const [categories, setCategories] = useState<DropDownItemType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<DropDownItemType>();
    const [verifiedDateTime, setVerifiedDateTime] = useState(props.details?.verifiedDateTime);
    const [expenseItems, setExpenseItems] = useState<ExpenseItemFields[]>(props.details?.expenseItems || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.details?.receipts || []);
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();

        const data: ExpenseFields = {
            expenseId: props.expenseId,
            billname: billName,
            pymtaccName: selectedPymtAccount?.content,
            amount,
            description,
            purchasedDate,
            tags,
            verifiedDateTime,
            expenseItems,
            categoryName: selectedCategory?.content || props.details?.categoryName,
            receipts,
        };

        // const formData = new FormData(document.createElement("form"));
        const formData = new FormData();
        data.receipts.forEach(rct => {
            if (!rct.file) return;
            formData.append(rct.id, rct.file);
            rct.file = undefined;
        });
        Object.entries(data).forEach((entry) => {
            const key = entry[0];
            let value = entry[1];
            if (value instanceof Date) value = String(value);
            else if (typeof value === "object") value = JSON.stringify(value);
            formData.append(key, value);
        });


        props.onSubmit(data, formData);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(PAGE_URL.expenseJournalRoot.fullUrl);
    };

    useEffect(() => {
        const myCategories = props.categoryTypes.map(ctg => {
            const itm: DropDownItemType = {
                id: ctg.configId || "configIdNeverUsed",
                content: ctg.name,
                tooltip: ctg.description
            };
            return itm;
        });
        setCategories(myCategories);
        const selectedCtg = myCategories.find(ctg => ctg.content === props.details?.categoryName);
        setSelectedCategory(selectedCtg);

        const myPymtAccounts: DropDownItemType[] = [];
        props.paymentAccounts.forEach((id, name) => {
            const itm: DropDownItemType = {
                id: id,
                content: name
            };
            myPymtAccounts.push(itm);
        });
        setPymtAccounts(myPymtAccounts);
        const selectedAcc = myPymtAccounts.find(acc => acc.content === props.details?.pymtaccName);
        setSelectedPymtAccount(selectedAcc);

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
                                defaultItem={ props.details?.pymtaccName }
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
                                defaultItem={ props.details?.categoryName }
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