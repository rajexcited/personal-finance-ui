import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faStore, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../../root";
import {
    TagsInput,
    Calendar,
    DropDown,
    Input,
    TextArea,
    DropDownItemType
} from "../../../../components";
import { ExpenseBelongsTo, ExpenseStatus, formatTimestamp, getLogger, IncomeFields, receiptService } from "../../services";
import { CacheAction, DownloadReceiptResource, ReceiptProps, UploadReceiptsModal } from "../../../../components/receipt";
import { PymtAccountFields } from "../../../pymt-accounts/services";
import { ConfigResource } from "../../../../shared";



export interface IncomeFormProps {
    submitLabel: string;
    onSubmit (fields: IncomeFields, formData: FormData): void;
    incomeId: string;
    incomeDetails?: IncomeFields;
    paymentAccounts: PymtAccountFields[];
    sourceTags: string[];
    incomeTypes: ConfigResource[];
}

const fcLogger = getLogger("FC.IncomeForm", null, null, "DEBUG");


export const IncomeForm: FunctionComponent<IncomeFormProps> = (props) => {
    const [billName, setBillName] = useState(props.incomeDetails?.billName || '');
    const [amount, setAmount] = useState(props.incomeDetails?.amount || '');
    const [description, setDescription] = useState(props.incomeDetails?.description || '');
    const [incomeDate, setIncomeDate] = useState(props.incomeDetails?.incomeDate as Date);
    const [tags, setTags] = useState<string[]>(props.incomeDetails?.tags || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.incomeDetails?.receipts || []);
    const [dropdownPymtAccountItems, setDropdownPymtAccountItems] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPymtAccount, setSelectedDropdownPymtAccount] = useState<DropDownItemType>();
    const [dropdownIncomeTypeList, setDropdownIncomeTypeList] = useState<DropDownItemType[]>([]);
    const [selectedDropdownIncomeType, setSelectedDropdownIncomeType] = useState<DropDownItemType>();
    const navigate = useNavigate();


    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);

        if (!props.incomeDetails?.incomeDate) {
            setIncomeDate(new Date());
        }

        const ddPymtAccList: DropDownItemType[] = props.paymentAccounts.map((pymtDetails) => ({
            id: pymtDetails.id,
            content: pymtDetails.shortName,
            tooltip: pymtDetails.dropdownTooltip
        }));
        setDropdownPymtAccountItems(ddPymtAccList);

        logger.debug("props.paymentAccounts =", props.paymentAccounts,
            ", props.incomeDetails?.paymentAccountId =", props.incomeDetails?.paymentAccountId,
            ", props.incomeDetails?.paymentAccountName =", props.incomeDetails?.paymentAccountName);

        if (props.incomeDetails?.paymentAccountId && props.incomeDetails.paymentAccountName) {
            let mySelectedPaymentAcc = ddPymtAccList.find(pymtacc => (pymtacc.id === props.incomeDetails?.paymentAccountId));
            if (!mySelectedPaymentAcc) {
                mySelectedPaymentAcc = {
                    id: props.incomeDetails.paymentAccountId,
                    content: props.incomeDetails.paymentAccountName
                };
            }
            logger.debug("mySelectedPaymentAcc =", mySelectedPaymentAcc);
            setSelectedDropdownPymtAccount(mySelectedPaymentAcc);
        }
        const ddTypeList: DropDownItemType[] = props.incomeTypes.map((typCfg) => ({
            id: typCfg.id,
            content: typCfg.value,
            tooltip: typCfg.description
        }));
        setDropdownIncomeTypeList(ddTypeList);

        if (props.incomeDetails?.incomeTypeId && props.incomeDetails.incomeTypeName) {
            let mySelectedType = ddTypeList.find(typ => (typ.id === props.incomeDetails?.incomeTypeId));
            if (!mySelectedType) {
                mySelectedType = {
                    id: props.incomeDetails.incomeTypeId,
                    content: props.incomeDetails.incomeTypeName
                };
            }
            logger.debug("mySelectedType =", mySelectedType);
            setSelectedDropdownIncomeType(mySelectedType);
        }
        logger.debug("props.sourceTags =", props.sourceTags);

    }, []);

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        const logger = getLogger("onSubmitHandler", fcLogger);
        if (!selectedDropdownIncomeType) {
            // this never gets called because it is required, but due to compilation added if condition
            throw new Error("Income Type is not selected");
        }

        const formData = new FormData();

        const datareceipts = receipts.map(rct => {
            if (rct.file) {
                logger.debug("receipt id=", rct.id, ", added file to formdata =", rct.file);
                formData.append(rct.id, rct.file);
            }

            const rctData: ReceiptProps = {
                id: rct.id,
                name: rct.name,
                contentType: rct.contentType,
                relationId: props.incomeId,
                url: rct.url,
                belongsTo: ExpenseBelongsTo.Income
            };

            return rctData;
        });

        const data: IncomeFields = {
            id: props.incomeId,
            billName: billName,
            paymentAccountId: selectedDropdownPymtAccount?.id,
            amount: amount,
            description: description,
            incomeDate: incomeDate,
            tags: tags,
            receipts: datareceipts,
            auditDetails: { createdOn: "", updatedOn: "" },
            belongsTo: ExpenseBelongsTo.Income,
            status: ExpenseStatus.Enable,
            incomeTypeId: selectedDropdownIncomeType.id,
            incomeTypeName: selectedDropdownIncomeType.content
        };

        Object.entries(data).forEach((entry) => {
            const key = entry[0];
            let value = entry[1];
            if (value instanceof Date) value = formatTimestamp(value);
            else if (typeof value === "object") value = JSON.stringify(value);
            logger.debug("added to form, key=", key, ", value =", value);
            formData.append(key, value);
        });

        logger.info("data =", data);
        props.onSubmit(data, formData);
    };

    const onCancelHandler: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        event.stopPropagation();
        navigate(getFullPath("expenseJournalRoot"));
    };

    function cacheReceiptFileHandler (receipt: ReceiptProps, cacheAction: CacheAction): Promise<DownloadReceiptResource> {
        return receiptService.cacheReceiptFile(receipt, cacheAction) as Promise<DownloadReceiptResource>;
    }

    function downloadReceiptsHandler (receipts: ReceiptProps[]): Promise<DownloadReceiptResource[]> {
        return receiptService.downloadReceipts(receipts);
    }

    return (
        <form onSubmit={ onSubmitHandler }>
            <div className="columns">
                <div className="column">
                    <div className="columns">
                        <div className="column">
                            <Input
                                id="income-bill-name"
                                label="Income Name: "
                                type="text"
                                placeholder="Enter Income Name"
                                size={ 20 }
                                initialValue={ billName }
                                tooltip="Have a short name that you can recognize"
                                leftIcon={ faStore }
                                key={ "income-bill-name" }
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
                                id="income-amount"
                                label="Income Amount: "
                                type="number"
                                placeholder="0.00"
                                min={ -10000000 }
                                max={ 10000000 }
                                initialValue={ amount }
                                leftIcon={ faDollarSign }
                                className="is-medium"
                                key={ "income-amount" }
                                onChange={ setAmount }
                                step={ 0.01 }
                                required={ true }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="income-pymt-acc"
                                key={ "income-pymt-acc" }
                                label="Payment Account: "
                                items={ dropdownPymtAccountItems }
                                onSelect={ (selected: DropDownItemType) => setSelectedDropdownPymtAccount(selected) }
                                selectedItem={ selectedDropdownPymtAccount }
                                defaultItem={ selectedDropdownPymtAccount }
                                required={ true }
                            />
                        </div>
                        <div className="column">
                            <DropDown
                                id="income-type"
                                key={ "income-type" }
                                label="Income Type: "
                                items={ dropdownIncomeTypeList }
                                onSelect={ (selected: DropDownItemType) => setSelectedDropdownIncomeType(selected) }
                                selectedItem={ selectedDropdownIncomeType }
                                defaultItem={ selectedDropdownIncomeType }
                                required={ true }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TextArea
                                id="income-desc"
                                label="Description: "
                                rows={ 2 }
                                value={ description }
                                onChange={ setDescription }
                                key={ "income-desc" }
                                maxlength={ 150 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TagsInput
                                id="income-tags"
                                label="Tags: "
                                defaultValue={ tags }
                                placeholder="Add Tags"
                                onChange={ setTags }
                                key={ "income-tags" }
                                sourceValues={ props.sourceTags }
                                maxTags={ 10 }
                            />
                        </div>
                    </div>
                </div>
                <div className="column is-one-third">
                    <div className="columns">
                        <div className="column">
                            <UploadReceiptsModal
                                receipts={ receipts }
                                relationId={ props.incomeId }
                                onChange={ setReceipts }
                                cacheReceiptFile={ cacheReceiptFileHandler }
                                downloadReceipts={ downloadReceiptsHandler }
                                belongsTo={ ExpenseBelongsTo.Income }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="my-1 py-1">
                                <Calendar
                                    key={ "income-date" }
                                    id="income-date"
                                    label="Income Date: "
                                    startDate={ incomeDate }
                                    onSelect={ (range) => { setIncomeDate((prev) => (range.start || prev)); } }
                                />
                            </div>
                        </div>
                    </div>
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
