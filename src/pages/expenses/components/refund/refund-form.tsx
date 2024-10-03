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
    DropDownItemType,
    TagObject,
    TagsInputSharePerson
} from "../../../../components";
import { ExpenseBelongsTo, expenseService, ExpenseStatus, formatTimestamp, getLogger, PurchaseFields, PurchaseRefundFields, receiptService } from "../../services";
import { CacheAction, DownloadReceiptResource, ReceiptProps, UploadReceiptsModal } from "../../../../components/receipt";
import { PymtAccountFields } from "../../../pymt-accounts/services";
import { ConfigResource, isNotBlank, parseTimestamp } from "../../../../shared";
import { SharePersonResource } from "../../../settings/services";



export interface PurchaseRefundFormProps {
    submitLabel: string;
    onSubmit (fields: PurchaseRefundFields, formData: FormData): void;
    refundId: string;
    refundDetails?: PurchaseRefundFields;
    purchaseDetails?: PurchaseFields;
    paymentAccounts: PymtAccountFields[];
    sourceTags: string[];
    reasons: ConfigResource[];
    sharePersons: SharePersonResource[];
}

const fcLogger = getLogger("FC.PurchaseRefundForm", null, null, "DISABLED");
const purchasePageMonths = 2;

const getPurchaseDropdownTooltip = (purchaseDetails: PurchaseFields) => {
    const ddTooltipLines: string[] = [];
    let ddTooltip = "";
    ddTooltip = purchaseDetails.description ? purchaseDetails.description : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(" " + ddTooltip + "  ");
    }
    ddTooltip = purchaseDetails.tags.length > 0 ? "Tags: " + purchaseDetails.tags.join(",") : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(" " + ddTooltip + "  ");
    }

    ddTooltip = purchaseDetails.purchaseTypeName ? "Type: " + purchaseDetails.purchaseTypeName + "; " : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(" " + ddTooltip + "  ");
    }
    return ddTooltipLines.join("&#10;&#13;");
};

const getPurchaseDropdownContent = (purchaseDetails: PurchaseFields) => {
    let ddContent = "Billname: " + purchaseDetails.billName + "; ";
    ddContent += purchaseDetails.amount !== undefined ? "Amount: " + purchaseDetails.amount + "; " : "";
    const purchasedDate = typeof purchaseDetails.purchasedDate === "string" ? parseTimestamp(purchaseDetails.purchasedDate) : purchaseDetails.purchasedDate;
    ddContent += "Purchase Date: " + formatTimestamp(purchasedDate, "MM-DD-YYYY");

    return ddContent;
};

export const PurchaseRefundForm: FunctionComponent<PurchaseRefundFormProps> = (props) => {
    const [billName, setBillName] = useState(props.refundDetails?.billName || '');
    const [amount, setAmount] = useState(props.refundDetails?.amount || '');
    const [description, setDescription] = useState(props.refundDetails?.description || '');
    const [refundDate, setRefundDate] = useState(props.refundDetails?.refundDate as Date);
    const [tags, setTags] = useState<string[]>(props.refundDetails?.tags || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.refundDetails?.receipts || []);
    const [dropdownPymtAccountItems, setDropdownPymtAccountItems] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPymtAccount, setSelectedDropdownPymtAccount] = useState<DropDownItemType>();
    const [purchaseDetailList, setPurchaseDetailList] = useState<PurchaseFields[]>([]);
    const [dropdownPurchaseDetailList, setDropdownPurchaseDetailList] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPurchaseDetail, setSelectedDropdownPurchaseDetail] = useState<DropDownItemType>();
    const [purchaseListPageNo, setPurchaseListPageNo] = useState<number>(1);
    const [dropdownRefundReasons, setDropdownRefundReasons] = useState<DropDownItemType[]>([]);
    const [selectedDropdownReason, setSelectedDropdownReason] = useState<DropDownItemType>();
    const [selectedSharePersonTagItems, setSelectedSharePersonTagItems] = useState<TagObject[]>([]);
    const [sourceSharePersonTagItems, setSourceSharePersonTagItems] = useState<TagObject[]>([]);
    const navigate = useNavigate();


    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);

        let purchasePymtAccId: string | undefined = undefined;
        if (props.purchaseDetails) {
            const myDdPurchaseDetail = {
                id: props.purchaseDetails.id,
                content: getPurchaseDropdownContent(props.purchaseDetails),
                tooltip: getPurchaseDropdownTooltip(props.purchaseDetails)
            };
            setSelectedDropdownPurchaseDetail(myDdPurchaseDetail);
            setDropdownPurchaseDetailList([myDdPurchaseDetail]);
            if (amount === "" && props.refundDetails?.amount === undefined && props.purchaseDetails.amount !== undefined) {
                setAmount(props.purchaseDetails.amount);
            }
            if (billName === "" && props.refundDetails?.billName === undefined) {
                setBillName("Refund for " + props.purchaseDetails.billName);
            }
            purchasePymtAccId = props.purchaseDetails.paymentAccountId;
        }

        if (!props.refundDetails?.refundDate) {
            setRefundDate(new Date());
        }

        const ddPymtAccList: DropDownItemType[] = props.paymentAccounts.map((pymtDetails) => ({
            id: pymtDetails.id,
            content: pymtDetails.shortName,
            tooltip: pymtDetails.dropdownTooltip
        }));
        setDropdownPymtAccountItems(ddPymtAccList);

        logger.debug("props.paymentAccounts =", props.paymentAccounts,
            ", props.refundDetails?.paymentAccountId =", props.refundDetails?.paymentAccountId,
            ", props.refundDetails?.paymentAccountName =", props.refundDetails?.paymentAccountName);

        if (props.refundDetails?.paymentAccountId && props.refundDetails.paymentAccountName) {
            let mySelectedPaymentAcc = ddPymtAccList.find(pymtacc => (pymtacc.id === props.refundDetails?.paymentAccountId));
            if (!mySelectedPaymentAcc) {
                mySelectedPaymentAcc = {
                    id: props.refundDetails.paymentAccountId,
                    content: props.refundDetails.paymentAccountName
                };
            }
            logger.debug("mySelectedPaymentAcc =", mySelectedPaymentAcc);
            setSelectedDropdownPymtAccount(mySelectedPaymentAcc);
        } else {
            let mySelectedPaymentAcc = ddPymtAccList.find(pymtacc => (pymtacc.id === purchasePymtAccId));
            if (mySelectedPaymentAcc) {
                setSelectedDropdownPymtAccount(prev => {
                    if (!prev) {
                        return mySelectedPaymentAcc;
                    }
                    return prev;
                });
            }
        }
        const ddreasonList: DropDownItemType[] = props.reasons.map((reasonCfg) => {
            let dropdownTooltip = reasonCfg.description || "";
            dropdownTooltip += reasonCfg.tags.length > 0 ? "; Tags: " + reasonCfg.tags.join(",") : "";
            return {
                id: reasonCfg.id,
                content: reasonCfg.name,
                tooltip: dropdownTooltip
            };
        });
        setDropdownRefundReasons(ddreasonList);

        if (props.refundDetails?.reasonId && props.refundDetails.reasonValue) {
            let mySelectedReason = ddreasonList.find(reason => (reason.id === props.refundDetails?.reasonId && reason.content === props.refundDetails.reasonValue));
            if (!mySelectedReason) {
                mySelectedReason = {
                    id: props.refundDetails.reasonId,
                    content: props.refundDetails.reasonValue
                };
            }
            logger.debug("mySelectedReason =", mySelectedReason);
            setSelectedDropdownReason(mySelectedReason);
        }

        const mySourceSharePersonTagItems = props.sharePersons.map(sp => {
            const itm: TagObject = {
                id: sp.id || "sharepersonIdNeverUsed",
                displayText: sp.nickName || `${sp.firstName} ${sp.lastName}`,
                searchText: [sp.nickName || "", sp.firstName, sp.lastName, sp.emailId].join(";")
            };
            return itm;
        });
        setSourceSharePersonTagItems(mySourceSharePersonTagItems);
        logger.info("props.sharePersons =", props.sharePersons, ", mySourceSharePersonTagItems =", mySourceSharePersonTagItems, ", props.details?.personIds =", props.refundDetails?.personIds);
        if (props.refundDetails && props.refundDetails.personIds.length > 0) {
            const mySelectedSharePersons = mySourceSharePersonTagItems.filter(sspt => props.refundDetails?.personIds.includes(sspt.id));
            setSelectedSharePersonTagItems(mySelectedSharePersons);
            logger.info("mySelectedSharePersons =", mySelectedSharePersons);
        }
        logger.debug("props.sourceTags =", props.sourceTags);

    }, []);

    const onSubmitHandler: React.FormEventHandler<HTMLFormElement> = async event => {
        event.preventDefault();
        const logger = getLogger("onSubmitHandler", fcLogger);
        if (!selectedDropdownReason) {
            // this never gets called because it is required, but due to compilation added if condition
            throw new Error("Reason is not selected");
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
                relationId: props.refundId,
                url: rct.url,
                belongsTo: ExpenseBelongsTo.PurchaseRefund
            };

            return rctData;
        });

        const purchaseDetail = purchaseDetailList.find(pd => selectedDropdownPurchaseDetail?.id === pd.id);

        const data: PurchaseRefundFields = {
            id: props.refundId,
            billName: billName,
            paymentAccountId: selectedDropdownPymtAccount?.id,
            amount: amount,
            description: description,
            refundDate: refundDate,
            tags: tags,
            receipts: datareceipts,
            auditDetails: { createdOn: "", updatedOn: "" },
            belongsTo: ExpenseBelongsTo.PurchaseRefund,
            status: ExpenseStatus.Enable,
            purchaseId: purchaseDetail?.id,
            purchaseDetails: purchaseDetail,
            reasonId: selectedDropdownReason.id,
            reasonValue: selectedDropdownReason.content,
            personIds: selectedSharePersonTagItems.map(sspt => sspt.id)
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

    const loadMorePurchaseList = async () => {
        const existingPurchaseIds = purchaseDetailList.map(prchs => prchs.id);
        const purchaseList = await expenseService.getPurchaseList(purchaseListPageNo, purchasePageMonths);

        const newDdMap: Record<string, DropDownItemType> = {};
        const newPurchaseList: PurchaseFields[] = [];
        purchaseList.forEach(prchs => {
            newDdMap[prchs.id] = {
                id: prchs.id,
                content: getPurchaseDropdownContent(prchs),
                tooltip: getPurchaseDropdownTooltip(prchs)
            };
            if (!existingPurchaseIds.includes(prchs.id)) {
                newPurchaseList.push(prchs);
            }
        });

        setPurchaseDetailList(prevList => ([...prevList, ...newPurchaseList]));
        setPurchaseListPageNo(prev => prev + 1);
        setDropdownPurchaseDetailList(prev => {
            const ddMap: Record<string, DropDownItemType> = {};
            prev.forEach(itm => ddMap[itm.id] = itm);
            Object.keys(newDdMap).filter(nid => !(nid in ddMap)).forEach(nid => {
                ddMap[nid] = newDdMap[nid];
            });

            return Object.values(ddMap);
        });
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
                                id="refund-bill-name"
                                label="Bill Name: "
                                type="text"
                                placeholder="Enter Refund billName"
                                size={ 20 }
                                initialValue={ billName }
                                tooltip="It could be store name, online site or specific product. Have short name that you can recognize"
                                leftIcon={ faStore }
                                key={ "refund-bill-name" }
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
                                id="refund-amount"
                                label="Refund Amount: "
                                type="number"
                                placeholder="0.00"
                                min={ -10000000 }
                                max={ 10000000 }
                                initialValue={ amount }
                                leftIcon={ faDollarSign }
                                className="is-medium"
                                key={ "refund-amount" }
                                onChange={ setAmount }
                                step={ 0.01 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="refund-pymt-acc"
                                key={ "refund-pymt-acc" }
                                label="Payment Account: "
                                items={ dropdownPymtAccountItems }
                                onSelect={ (selected: DropDownItemType) => setSelectedDropdownPymtAccount(selected) }
                                selectedItem={ selectedDropdownPymtAccount }
                                defaultItem={ selectedDropdownPymtAccount }
                            />
                        </div>
                        <div className="column">
                            <DropDown
                                id="refund-reason"
                                key={ "refund-reason" }
                                label="Refund Reason: "
                                items={ dropdownRefundReasons }
                                onSelect={ (selected: DropDownItemType) => setSelectedDropdownReason(selected) }
                                selectedItem={ selectedDropdownReason }
                                defaultItem={ selectedDropdownReason }
                                required={ true }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <DropDown
                                id="purchase-dd"
                                label="Purchase: "
                                items={ dropdownPurchaseDetailList }
                                key={ "purchase-dd" }
                                onSelect={ (selected) => setSelectedDropdownPurchaseDetail(selected as DropDownItemType) }
                                direction="down"
                                selectedItem={ selectedDropdownPurchaseDetail }
                                defaultItem={ selectedDropdownPurchaseDetail }
                                loadMore={ loadMorePurchaseList }
                                allowSearch={ true }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TagsInputSharePerson
                                id="person-tags"
                                label="Tag Persons: "
                                defaultValue={ selectedSharePersonTagItems }
                                placeholder="Tag Person by Name"
                                onChange={ setSelectedSharePersonTagItems }
                                key={ "person-tags" }
                                sourceValues={ sourceSharePersonTagItems }
                                maxTags={ 10 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TextArea
                                id="refund-desc"
                                label="Description: "
                                rows={ 2 }
                                value={ description }
                                onChange={ setDescription }
                                key={ "refund-desc" }
                                maxlength={ 150 }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <TagsInput
                                id="refund-tags"
                                label="Tags: "
                                defaultValue={ tags }
                                placeholder="Add Tags"
                                onChange={ setTags }
                                key={ "refund-tags" }
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
                                relationId={ props.refundId }
                                onChange={ setReceipts }
                                cacheReceiptFile={ cacheReceiptFileHandler }
                                downloadReceipts={ downloadReceiptsHandler }
                                belongsTo={ ExpenseBelongsTo.PurchaseRefund }
                            />
                        </div>
                    </div>
                    <div className="columns">
                        <div className="column">
                            <div className="my-1 py-1">
                                <Calendar
                                    key={ "refund-date" }
                                    id="refund-date"
                                    label="Refund Date: "
                                    startDate={ refundDate }
                                    onSelect={ (range) => { setRefundDate((prev) => (range.start || prev)); } }
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
