import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PAGE_URL } from "../page-url";
import { faStore, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import Input from "../../components/input";
import DropDown from "../../components/dropdown";
import TextArea from "../../components/textarea";
import Calendar from "../../components/calendar";
import TagsInput from "../../components/TagsInput";
import VerifyIndicator from "../../components/verify-indicator";
import ExpenseBreakDown from "./expense-breakdown";
import { ExpenseItemType, ExpenseData } from "./expense-context";
import { useContext } from "react";
import { AccountContext } from "../accounts/account-context";
import CategoryServiceCreator, { ConfigType } from "./expense-category-service";


const CategoryService = await CategoryServiceCreator();

export interface ExpenseFormProps {
    submitLabel: string;
    expenseId: string;
    onSubmit (fields: ExpenseData): void;
}

const ExpenseForm: FunctionComponent<ExpenseFormProps> = (props) => {
    const [billName, setBillName] = useState('');
    const [amount, setAmount] = useState('');
    const [pymtAccount, setPymtAccount] = useState('');
    const [description, setDescription] = useState('');
    const [purchasedDate, setPurchaseDate] = useState(new Date());
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('');
    const [verifiedDateTime, setVerifiedDateTime] = useState<Date>();
    const [expenseItems, setExpenseItems] = useState<ExpenseItemType[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const navigate = useNavigate();

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        // const categoryTypes =(async () => {
        const categoryTypes = await CategoryService.getCategories();
        const categoryId = categoryTypes.find(c => c.name === category)?.configId;

        const data: ExpenseData = {
            billname: billName,
            pymtacc: pymtAccount,
            expenseId: props.expenseId,
            amount,
            description,
            purchasedDate,
            tags,
            verifiedDateTime,
            expenseItems,
            categoryId
        };
        props.onSubmit(data);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(PAGE_URL.expenseJournal.fullUrl);
    };

    const accounts = useContext(AccountContext);
    const pymtAccounts = accounts.map(acc => acc.shortName);

    // const pymtAccounts = [
    //     "chase cc",
    //     "bofa checking 2530"
    // ];

    // const categories = [
    //     "fee",
    //     "commute",
    //     "income",
    //     "food shopping",
    //     "health",
    //     "home expenses",
    //     "investment",
    //     "maintenance",
    //     "nri transfer",
    //     "hangout",
    //     "gift",
    //     "shopping"
    // ];

    useEffect(() => {
        (async () => {
            const categoryTypes = await CategoryService.getCategories() as ConfigType[];
            setCategories(categoryTypes.map(ct => ct.name));
        })();
    }, []);

    // const dateFormat = 'MM/DD/YYYY';

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
                                label="Payment Account: "
                                items={ pymtAccounts }
                                allowInput={ true }
                                key={ "xpns-pymt-acc" }
                                onSelect={ setPymtAccount }
                                selectedItem={ pymtAccount }
                            />

                        </div>
                        <div className="column">
                            <DropDown
                                id="xpns-category"
                                label="Category: "
                                items={ categories }
                                key={ "xpns-category" }
                                onSelect={ setCategory }
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