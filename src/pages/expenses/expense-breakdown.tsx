import { FunctionComponent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import ExpenseBreakDownItem, { ExpenseItemProps } from "./expense-breakdown-item";
import { ExpenseItemType } from "./expense-context";



export interface ExpenseBreakDownProps {
    categories: string[];
    header?: string;
    expenseItems: ExpenseItemType[];
    billname?: string;
    amount?: string;
    parentExpenseId: string;
    onChange (items: ExpenseItemType[]): void;
}

const idPrefix = "xpnse-item-";

const ExpenseBreakDown: FunctionComponent<ExpenseBreakDownProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const [expenseItems, setExpenseItems] = useState(props.expenseItems);
    const [totalItemizeAmount, setTotalItemizeAmount] = useState(0);

    const addItem = (oldList: ExpenseItemType[]) => {
        const ids = oldList.map(item => Number(item.id.replace(idPrefix, "")));
        let maxIndexInList = Math.max(...ids, 0);
        return [...oldList, getEmptyExpenseItem(props.parentExpenseId, maxIndexInList + 1)];
    };

    useEffect(() => {
        // initialize
        setExpenseItems(addItem);
    }, []);

    const getEmptyExpenseItem = (parentExpenseId: string, ind: number): ExpenseItemType => {
        return {
            id: idPrefix + ind,
            parentExpenseId: parentExpenseId,
            amount: '',
            category: '',
            description: '',
            name: '',
            tags: ''
        };
    };

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onChangeItemHandler = (item: ExpenseItemProps) => {
        const itemToUpdate = expenseItems?.find(it => item.id === it.id);
        if (!itemToUpdate) {
            console.error("item with id [ '" + item.id + "' ] not found.");
            return;
        }
        itemToUpdate.name = item.name;
        itemToUpdate.amount = item.amount;
        itemToUpdate.category = item.category;
        itemToUpdate.description = item.description;
        itemToUpdate.tags = item.tags;


        const emptyItem = expenseItems?.find(isEmptyItemRow);
        if (!emptyItem) {
            setExpenseItems(addItem);
        }
        props.onChange(expenseItems.filter(it => !isEmptyItemRow(it)));
        updateItemizeTotalAmount(expenseItems);
    };

    const isEmptyItemRow = (item: ExpenseItemType) => (!item.amount && !item.category && !item.description && !item.name && !item.tags);



    const onRemoveItemHandler = (id: string) => {
        setExpenseItems(oldList => {
            const newList = oldList.filter(item => id !== item.id);
            updateItemizeTotalAmount(newList);
            props.onChange(newList.filter(it => !isEmptyItemRow(it)));
            return newList;
        });
    };

    const updateItemizeTotalAmount = (items: ExpenseItemType[]) => {
        const sumOfAmount = expenseItems.map(it => Number(it.amount)).reduce(
            (total, itemamt) => total + (isNaN(itemamt) ? 0 : itemamt), 0);
        setTotalItemizeAmount(sumOfAmount);
    };

    const amt = props.amount ? Number(props.amount) : 0;
    const amountdiff = amt - totalItemizeAmount;
    const tooltipText = amountdiff === 0 ? "itemize amount total is matching the expense amount" :
        amountdiff > 0 ? "itemize amount total is less than expense amount, difference is " + amountdiff :
            "expense amount is less than the itemize amout, difference is " + amountdiff;

    return (
        <div className="card">
            <header className="card-header">
                <p className="card-header-title">
                    <span className="card-header-icon" onClick={ onClickBodyToggleHandler }>
                        <span className="icon">
                            <FontAwesomeIcon icon={ faBars } />
                        </span>
                        <span className="px-2">
                            { props.expenseItems && props.expenseItems.length > 1 ? "View / Update " : "Break into " }{ props.header || "Expense Items" }
                        </span>
                    </span>
                </p>
                <button className="card-header-icon" aria-label="expand breakdown" onClick={ onClickBodyToggleHandler }>
                    <span className="icon">
                        <FontAwesomeIcon icon={ isBodyOpen ? faAngleUp : faAngleDown } />
                    </span>
                </button>
            </header>
            <div className={ `card-content ${isBodyOpen ? "is-active" : "is-hidden"}` }>
                <div className="content">
                    {
                        expenseItems?.map(item =>
                            <ExpenseBreakDownItem
                                key={ item.id }
                                id={ item.id }
                                parentExpenseId={ item.parentExpenseId }
                                name={ item.name }
                                amount={ item.amount }
                                category={ item.category }
                                description={ item.description }
                                tags={ item.tags }
                                categories={ props.categories }
                                onChange={ onChangeItemHandler }
                                onRemove={ onRemoveItemHandler }
                            />
                        )
                    }
                </div>
            </div>
            <footer className={ `card-footer ${isBodyOpen ? "is-active" : "is-hidden"}` }>
                <div className="container my-2 p-2">
                    <div className="columns">
                        <div className="column is-2">
                            <div className="field">
                                <label htmlFor="xpns-item-total-amount" className="label">
                                    Total Itemize Amount:
                                </label>
                            </div>
                        </div>
                        <div className="column">
                            <button
                                className={ `button is-light tooltip ${amountdiff !== 0 ? "is-danger" : ""} totalItemizeAmount}` }
                                data-tooltip={ tooltipText }
                                disabled>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                { totalItemizeAmount }
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ExpenseBreakDown;