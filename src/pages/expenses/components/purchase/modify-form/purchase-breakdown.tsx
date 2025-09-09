import { FunctionComponent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown, faBars } from "@fortawesome/free-solid-svg-icons";
import _ from "lodash";
import { PurchaseBreakDownItem } from "./purchase-breakdown-item";
import { PurchaseItemFields, getLogger } from "../../../services";
import { DropDownItemType } from "../../../../../components";
import { formatAmount } from "../../../../../formatters";


export interface PurchaseBreakDownProps {
    dropdownPurchaseTypeItems: DropDownItemType[];
    header?: string;
    items: PurchaseItemFields[];
    billname?: string;
    amount?: string;
    parentPurchaseId: string;
    sourceTags: string[];
    onChange (items: PurchaseItemFields[]): void;
}

const idPrefix = "purchase-item-";
const fcLogger = getLogger("FC.PurchaseBreakDown", null, null, "DISABLED");

export const PurchaseBreakDown: FunctionComponent<PurchaseBreakDownProps> = (props) => {
    const [isBodyOpen, setBodyOpen] = useState(false);
    const [items, setItems] = useState<PurchaseItemFields[]>([]);
    const [totalItemizeAmount, setTotalItemizeAmount] = useState(0);

    const addItem = (oldList: PurchaseItemFields[]) => {
        const ids = oldList.map(item => item.id || "")
            .map(itemId => Number(itemId.replace(idPrefix, "")))
            .map(idnum => isNaN(idnum) ? 0 : idnum);
        const maxIndexInList = Math.max(...ids, 0);
        return [...oldList, getEmptyPurchaseItem(props.parentPurchaseId, maxIndexInList + 1)];
    };

    useEffect(() => {
        // initialize
        props.items.forEach((item, ind) => {
            item.id = item.id || (idPrefix + ind);
        });
        const items = addItem(props.items);
        setItems(items);
    }, []);

    const getEmptyPurchaseItem = (parentPurchaseId: string, ind: number): PurchaseItemFields => {
        return {
            id: idPrefix + ind,
            amount: '',
            purchaseTypeName: '',
            description: '',
            billName: '',
            tags: [],
        };
    };

    const onClickBodyToggleHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setBodyOpen((oldstate) => !oldstate);
    };

    const onChangeItemHandler = (item: PurchaseItemFields) => {
        const logger = getLogger("onChangeItemHandler", fcLogger);
        const itemToUpdate = items?.find(it => item.id === it.id);
        if (!itemToUpdate) {
            logger.error("item with id [ '" + item.id + "' ] not found.");
            return;
        }
        itemToUpdate.billName = item.billName;
        itemToUpdate.amount = item.amount;
        itemToUpdate.purchaseTypeName = item.purchaseTypeName;
        itemToUpdate.description = item.description;
        itemToUpdate.tags = [...item.tags];

        const emptyItem = items?.find(isEmptyItemRow);
        if (!emptyItem) {
            setItems(addItem);
        }
        props.onChange(items.filter(it => !isEmptyItemRow(it)));
        updateItemizeTotalAmount(items);
    };

    const isEmptyItemRow = (item: PurchaseItemFields) => (!item.amount && !item.purchaseTypeName && !item.description && !item.billName && !item.tags.length);

    const onRemoveItemHandler = (id: string) => {
        setItems(oldList => {
            const newList = oldList.filter(item => id !== item.id);
            updateItemizeTotalAmount(newList);
            props.onChange(newList.filter(it => !isEmptyItemRow(it)));
            return newList;
        });
    };

    const updateItemizeTotalAmount = (items: PurchaseItemFields[]) => {
        const sumOfAmount = items.map(it => Number(it.amount)).reduce(
            (total, itemamt) => total + (isNaN(itemamt) ? 0 : itemamt), 0);
        setTotalItemizeAmount(sumOfAmount);
    };

    const amt = props.amount ? Number(props.amount) : 0;
    const amountdiff = amt - totalItemizeAmount;
    const tooltipText = _.round(amountdiff, 2) === 0 ? "itemize amount total is matching the purchase amount" :
        amountdiff > 0 ? "itemize amount total is less than purchase amount, difference is " + formatAmount(amountdiff) :
            "purchase amount is less than the itemize amout, difference is " + formatAmount(amountdiff);

    return (
        <div className="card">
            <header className="card-header">
                <p className="card-header-title">
                    <span className="card-header-icon" onClick={ onClickBodyToggleHandler }>
                        <span className="icon">
                            <FontAwesomeIcon icon={ faBars } />
                        </span>
                        <span className="px-2">
                            { props.items && props.items.length > 1 ? "View / Update " : "Break into " }{ props.header || "Purchase Items" }
                        </span>
                    </span>
                </p>
                <button className="card-header-icon" aria-label="expand breakdown" onClick={ onClickBodyToggleHandler }>
                    <span>
                        { items.length - 1 } item { items.length > 2 ? "s" : "" }
                    </span>
                    <span className="icon">
                        <FontAwesomeIcon icon={ isBodyOpen ? faAngleUp : faAngleDown } />
                    </span>
                </button>
            </header>
            <div className={ `card-content ${isBodyOpen ? "is-active" : "is-hidden"}` }>
                <div className="content">
                    {
                        items.map(item =>
                            <PurchaseBreakDownItem
                                key={ item.id }
                                itemDetail={ item }
                                dropdownPurchaseTypeItems={ props.dropdownPurchaseTypeItems }
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
