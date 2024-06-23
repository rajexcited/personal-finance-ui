import { FunctionComponent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import ExpenseBreakDownItem, { ExpenseItemProps } from "./expense-breakdown-item";
import { ExpenseItemFields } from "../../services";
import { DropDownItemType } from "../../../../components";
import _ from "lodash";
import { formatAmount } from "../../../../formatters";
import { getLogger } from "../../../../services";


export interface ExpenseBreakDownProps {
    categories: DropDownItemType[];
    header?: string;
    expenseItems: ExpenseItemFields[];
    billname?: string;
    amount?: string;
    parentExpenseId: string;
    sourceTags: string[];
    onChange (items: ExpenseItemFields[]): void;
}

const idPrefix = "xpnse-item-";

const ExpenseBreakDown: FunctionComponent<ExpenseBreakDownProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const [expenseItems, setExpenseItems] = useState<ExpenseItemFields[]>([]);
    const [totalItemizeAmount, setTotalItemizeAmount] = useState(0);

    const addItem = (oldList: ExpenseItemFields[]) => {
        const ids = oldList.map(item => item.id || "")
            .map(itemId => Number(itemId.replace(idPrefix, "")))
            .map(idnum => isNaN(idnum) ? 0 : idnum);
        let maxIndexInList = Math.max(...ids, 0);
        return [...oldList, getEmptyExpenseItem(props.parentExpenseId, maxIndexInList + 1)];
    };

    useEffect(() => {
        // initialize
        props.expenseItems.forEach((item, ind) => {
            item.id = item.id || (idPrefix + ind);
        });
        const items = addItem(props.expenseItems);
        setExpenseItems(items);
    }, []);

    const getEmptyExpenseItem = (parentExpenseId: string, ind: number): ExpenseItemFields => {
        return {
            id: idPrefix + ind,
            amount: '',
            expenseCategoryName: '',
            description: '',
            billName: '',
            tags: [],
        };
    };

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onChangeItemHandler = (item: ExpenseItemFields) => {
        const logger = getLogger("FC.ExpenseBreakDown.onChangeItemHandler");
        const itemToUpdate = expenseItems?.find(it => item.id === it.id);
        if (!itemToUpdate) {
            logger.error("item with id [ '" + item.id + "' ] not found.");
            return;
        }
        itemToUpdate.billName = item.billName;
        itemToUpdate.amount = item.amount;
        itemToUpdate.expenseCategoryName = item.expenseCategoryName;
        itemToUpdate.description = item.description;
        itemToUpdate.tags = [...item.tags];

        const emptyItem = expenseItems?.find(isEmptyItemRow);
        if (!emptyItem) {
            setExpenseItems(addItem);
        }
        props.onChange(expenseItems.filter(it => !isEmptyItemRow(it)));
        updateItemizeTotalAmount(expenseItems);
    };

    const isEmptyItemRow = (item: ExpenseItemFields) => (!item.amount && !item.expenseCategoryName && !item.description && !item.billName && !item.tags.length);

    const onRemoveItemHandler = (id: string) => {
        setExpenseItems(oldList => {
            const newList = oldList.filter(item => id !== item.id);
            updateItemizeTotalAmount(newList);
            props.onChange(newList.filter(it => !isEmptyItemRow(it)));
            return newList;
        });
    };

    const updateItemizeTotalAmount = (items: ExpenseItemFields[]) => {
        const sumOfAmount = expenseItems.map(it => Number(it.amount)).reduce(
            (total, itemamt) => total + (isNaN(itemamt) ? 0 : itemamt), 0);
        setTotalItemizeAmount(sumOfAmount);
    };

    const amt = props.amount ? Number(props.amount) : 0;
    const amountdiff = amt - totalItemizeAmount;
    const tooltipText = _.round(amountdiff, 2) === 0 ? "itemize amount total is matching the expense amount" :
        amountdiff > 0 ? "itemize amount total is less than expense amount, difference is " + formatAmount(amountdiff) :
            "expense amount is less than the itemize amout, difference is " + formatAmount(amountdiff);

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
                                itemDetail={ item }
                                categories={ props.categories }
                                sourceTags={ props.sourceTags }
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
                                className={ `button is-light tooltip is-tooltip-multiline ${_.round(amountdiff, 2) !== 0 ? "is-danger" : ""}` }
                                data-tooltip={ tooltipText }
                                disabled>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                { formatAmount(totalItemizeAmount) }
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