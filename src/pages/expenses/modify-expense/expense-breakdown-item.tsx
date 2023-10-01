import { FunctionComponent, useEffect, useState } from "react";
import { TagsInput, Input, DropDown, TextArea, DropDownItemType } from "../../../components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { ExpenseItemFields } from "../store";


export interface ExpenseItemProps extends ExpenseItemFields {
    categories: DropDownItemType[];
    onChange (item: ExpenseItemFields): void;
    onRemove (id: string): void;
}

const ExpenseBreakDownItem: FunctionComponent<ExpenseItemProps> = (props) => {
    const [itemBillName, setItemBillName] = useState(props.billname || '');
    const [itemAmount, setItemAmount] = useState(props.amount || '');
    const [itemCategory, setItemCategory] = useState<DropDownItemType>();
    const [itemTags, setItemTags] = useState(props.tags || '');
    const [itemDescription, setItemDescription] = useState(props.description || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const data = {
                ...props,
                name: itemBillName,
                amount: itemAmount,
                tags: itemTags,
                description: itemDescription,
                categoryName: itemCategory?.content,
            };
            delete data.categoryId;
            props.onChange(data);
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [itemBillName, itemAmount, itemCategory, itemTags, itemDescription]);

    useEffect(() => {
        if (props.categoryName !== itemCategory?.content && props.categories) {
            const ctgMatched = props.categories.find((ctg) => ctg.content === props.categoryName);
            if (ctgMatched) setItemCategory(ctgMatched);
        }
    }, [props.categoryName, props.categories]);

    const onCLickRemoveHandler: React.MouseEventHandler<HTMLSpanElement> = event => {
        event.preventDefault();
        props.onRemove(props.id);
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
                {/* <Autocomplete
                    id={ "xpns-item-bill-name-auto-cmplt" }
                    key={ "xpns-item-bill-name-auto-cmplt" + itemBillName }
                    data={ [itemBillName] }
                /> */}
                <Input
                    id="xpns-item-bill-name"
                    label="Item Name: "
                    type="text"
                    placeholder="Enter Items"
                    size={ 20 }
                    initialValue={ itemBillName }
                    key={ "xpns-item-bill-name" }
                    onChange={ setItemBillName }
                    className="is-large"
                />
            </div>
            <div className="column">
                <Input
                    id="xpns-item-amount"
                    label="Amount: "
                    type="number"
                    placeholder="0.00"
                    min={ -10000000 }
                    max={ 10000000 }
                    initialValue={ itemAmount }
                    leftIcon={ faDollarSign }
                    className="is-large"
                    key={ "xpns-item-amount" }
                    onChange={ setItemAmount }
                    step={ 0.01 }
                />
            </div>
            <div className="column">
                <DropDown
                    id="xpns-item-category"
                    label="Item Category: "
                    items={ props.categories }
                    key={ "xpns-item-category" }
                    onSelect={ (selected: DropDownItemType) => setItemCategory(selected) }
                    direction="down"
                    selectedItem={ itemCategory }
                    size="medium"
                />
            </div>
            <div className="column">
                <TextArea
                    id="xpns-item-desc"
                    label="Item Description: "
                    rows={ 2 }
                    value={ itemDescription }
                    onChange={ setItemDescription }
                    key={ "xpns-item-desc" }
                />
            </div>
            <div className="column">
                <TagsInput
                    id="xpns-item-tags"
                    label="Item Tags: "
                    value={ itemTags }
                    placeholder="Add Item Tags"
                    onChange={ setItemTags }
                    key={ "xpns-item-tags" }
                />
            </div>
        </div>
    );
};

export default ExpenseBreakDownItem;