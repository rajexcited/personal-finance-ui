import { FunctionComponent, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../../navigation";
import { faStore, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import {
    TagsInput,
    Calendar,
    DropDown,
    Input,
    TextArea,
    VerifyIndicator,
    DropDownItemType
} from "../../../components";
import ExpenseBreakDown from "./expense-breakdown";
import { ExpenseItemFields, ExpenseFields } from "../store";
import { PymtAccountContext } from "../../pymt-accounts";
import { CategoryService } from "../services";
import { ConfigType } from "../../../services";
import { v4 as uuidv4 } from "uuid";


const categoryService = await CategoryService();

export interface ExpenseFormProps {
    submitLabel: string;
    expenseId: string;
    onSubmit (fields: ExpenseFields): void;
    details?: ExpenseFields;
}

const ExpenseForm: FunctionComponent<ExpenseFormProps> = (props) => {
    const [billName, setBillName] = useState(props.details?.billname || '');
    const [amount, setAmount] = useState(props.details?.amount || '');
    const [pymtAccount, setPymtAccount] = useState(props.details?.pymtacc || '');
    const [description, setDescription] = useState(props.details?.description || '');
    const [purchasedDate, setPurchaseDate] = useState(props.details?.purchasedDate || new Date());
    const [tags, setTags] = useState(props.details?.tags || '');
    const [categories, setCategories] = useState<DropDownItemType[]>([]);
    const [category, setCategory] = useState<DropDownItemType>();
    const [verifiedDateTime, setVerifiedDateTime] = useState(props.details?.verifiedDateTime);
    const [expenseItems, setExpenseItems] = useState<ExpenseItemFields[]>(props.details?.expenseItems || []);
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();

        const data: ExpenseFields = {
            id: props.details?.id || uuidv4(),
            expenseId: props.expenseId,
            billname: billName,
            pymtacc: pymtAccount,
            amount,
            description,
            purchasedDate,
            tags,
            verifiedDateTime,
            expenseItems,
            categoryName: category?.content
        };

        props.onSubmit(data);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(PAGE_URL.expenseJournalRoot.fullUrl);
    };

    const accountContextObject = useContext(PymtAccountContext);
    const pymtAccounts = accountContextObject.accounts.map(acc => acc.shortName);

    useEffect(() => {
        categoryService.getCategories()
            .then((categoryTypes: ConfigType[]) => {
                const myCategories = categoryTypes.map(ctg => {
                    const itm: DropDownItemType = {
                        id: ctg.configId || "configIdNeverUsed",
                        content: ctg.name,
                        tooltip: ctg.description
                    };
                    return itm;
                });
                setCategories(myCategories);
            });
    }, []);

    useEffect(() => {
        if (props.details?.categoryName !== category?.content && categories) {
            const ctgMatched = categories.find((ctg) => ctg.content === props.details?.categoryName);
            if (ctgMatched) setCategory(ctgMatched);
        }
    }, [props.details?.categoryName, categories]);

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
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <Input
                                id="xpns-amount"
                                label="Amount: "
                                type="number"
                                placeholder="0.00"
                                min={ -10000000 }
                                max={ 10000000 }
                                initialValue={ amount }
                                leftIcon={ faDollarSign }
                                className="is-large"
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
                                onSelect={ (id: string) => setPymtAccount(id) }
                                selectedItem={ pymtAccount }
                            />
                        </div>
                        <div className="column">
                            <DropDown
                                id="xpns-category"
                                label="Category: "
                                items={ categories }
                                key={ "xpns-category" }
                                onSelect={ (selected: DropDownItemType) => setCategory(selected) }
                                direction="down"
                                selectedItem={ category }
                            />

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
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
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