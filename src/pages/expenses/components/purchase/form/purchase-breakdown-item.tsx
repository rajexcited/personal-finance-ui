import { FunctionComponent, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { TagsInput, Input, DropDown, TextArea, DropDownItemType } from "../../../../../components";
import { PurchaseItemFields } from "../../../services";


export interface PurchaseSubItemProps {
    onChange (item: PurchaseItemFields): void;
    onRemove (id: string): void;
    dropdownPurchaseTypeItems: DropDownItemType[];
    sourceTags: string[];
    itemDetail: PurchaseItemFields;
}

export const PurchaseBreakDownItem: FunctionComponent<PurchaseSubItemProps> = (props) => {
    const [itemBillName, setItemBillName] = useState(props.itemDetail.billName || '');
    const [itemAmount, setItemAmount] = useState(props.itemDetail.amount || '');
    const [itemPurchaseType, setItemPurchaseType] = useState<DropDownItemType>();
    const [itemTags, setItemTags] = useState(props.itemDetail.tags || '');
    const [itemDescription, setItemDescription] = useState(props.itemDetail.description || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const data: PurchaseItemFields = {
                ...props.itemDetail,
                billName: itemBillName,
                amount: itemAmount,
                tags: itemTags,
                description: itemDescription,
                purchaseTypeName: itemPurchaseType?.content || props.itemDetail.purchaseTypeName,
                purchaseTypeId: undefined,
            };
            props.onChange(data);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [itemBillName, itemAmount, itemPurchaseType, itemTags, itemDescription]);

    useEffect(() => {
        if (props.itemDetail.purchaseTypeId && props.itemDetail.purchaseTypeName) {
            const purchaseTypeMatched = props.dropdownPurchaseTypeItems.find((purchaseType) => purchaseType.id === props.itemDetail.purchaseTypeId);
            if (purchaseTypeMatched) { setItemPurchaseType(purchaseTypeMatched); }
            else {
                setItemPurchaseType({
                    id: props.itemDetail.purchaseTypeId,
                    content: props.itemDetail.purchaseTypeName
                });
            }
        } else {
            setItemPurchaseType(undefined);
        }
    }, [props.itemDetail.purchaseTypeId, props.itemDetail.purchaseTypeName, props.dropdownPurchaseTypeItems]);

    const onCLickRemoveHandler: React.MouseEventHandler<HTMLSpanElement> = event => {
        event.preventDefault();
        props.onRemove(props.itemDetail.id || "");
    };

    return (
        <div className="columns">
            <div className="column is-one-twenty-fourth my-5 py-5">
                <a className="mr-1 pr-1" onClick={ onCLickRemoveHandler }>
                    <span className="icon has-text-danger">
                        <FontAwesomeIcon icon={ faTrashAlt } size="lg" />
                    </span>
                </a>
            </div>
            <div className="column">
                <Input
                    id="purchase-item-bill-name"
                    label="Item Name: "
                    type="text"
                    placeholder="Enter Items"
                    size={ 20 }
                    initialValue={ itemBillName }
                    key={ "purchase-item-bill-name" }
                    onChange={ setItemBillName }
                    className="is-large"
                    maxlength={ 50 }
                />
            </div>
            <div className="column">
                <Input
                    id="purchase-item-amount"
                    label="Amount: "
                    type="number"
                    placeholder="0.00"
                    min={ -10000000 }
                    max={ 10000000 }
                    initialValue={ itemAmount }
                    leftIcon={ faDollarSign }
                    className="is-large"
                    key={ "purchase-item-amount" }
                    onChange={ setItemAmount }
                    step={ 0.01 }
                />
            </div>
            <div className="column">
                <DropDown
                    id="purchase-item-type"
                    label="Item Purchase Type: "
                    items={ props.dropdownPurchaseTypeItems }
                    key={ "purchase-item-type" }
                    onSelect={ (selected: DropDownItemType) => setItemPurchaseType(selected) }
                    direction="down"
                    selectedItem={ itemPurchaseType }
                    size="medium"
                    defaultItem={ itemPurchaseType }
                />
            </div>
            <div className="column">
                <TextArea
                    id="purchase-item-desc"
                    label="Item Description: "
                    rows={ 2 }
                    value={ itemDescription }
                    onChange={ setItemDescription }
                    key={ "purchase-item-desc" }
                    maxlength={ 150 }
                />
            </div>
            <div className="column">
                <TagsInput
                    id="purchase-item-tags"
                    label="Item Tags: "
                    defaultValue={ itemTags }
                    placeholder="Add Item Tags"
                    onChange={ setItemTags }
                    key={ "purchase-item-tags" }
                    sourceValues={ props.sourceTags }
                    maxTags={ 10 }
                />
            </div>
        </div>
    );
};
