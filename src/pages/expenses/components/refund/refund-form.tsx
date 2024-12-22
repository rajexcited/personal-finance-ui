import { FunctionComponent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { faStore, faDollarSign, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getFullPath } from "../../../root";
import {
    TagsInput,
    Calendar,
    DropDown,
    Input,
    TextArea,
    DropDownItemType,
    TagObject,
    TagsInputSharePerson,
    CurrencySymbol,
    ViewDialog,
    Animated
} from "../../../../components";
import { ExpenseBelongsTo, expenseService, ExpenseStatus, formatTimestamp, getLogger, PurchaseFields, PurchaseRefundFields, receiptService } from "../../services";
import { CacheAction, DownloadReceiptResource, ReceiptProps, UploadReceiptsModal } from "../../../../components/receipt";
import { PymtAccountFields } from "../../../pymt-accounts/services";
import { ConfigResource, getDateInstance, isNotBlank } from "../../../../shared";
import { CurrencyProfileResource, SharePersonResource } from "../../../settings/services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


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
    currencyProfiles: CurrencyProfileResource[];
}

interface PurchaseDetailReference {
    purchaseId: string;
    purchaseItemId: string | null;
    billName: string;
    amount: string;
    paymentAccountName: string;
    taggingPersons: string[];
}

const fcLogger = getLogger("FC.PurchaseRefundForm", null, null, "DEBUG");
const purchasePageMonths = 2;
const MAX_ALLOWED_PURCHASE_DROPDOWN_ITEMS = 30;

const getPurchaseDropdownTooltip = (purchaseDetails: PurchaseFields) => {
    const ddTooltipLines: string[] = [];
    let ddTooltip = "";
    ddTooltip = purchaseDetails.description ? purchaseDetails.description : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(ddTooltip);
    }
    ddTooltip = purchaseDetails.tags.length > 0 ? "Tags:" + purchaseDetails.tags.join(",") : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(ddTooltip);
    }

    ddTooltip = purchaseDetails.purchaseTypeName ? "Type:" + purchaseDetails.purchaseTypeName + "; " : "";
    if (isNotBlank(ddTooltip)) {
        ddTooltipLines.push(ddTooltip);
    }
    // return ddTooltipLines.join("&#10;&#13;");
    return ddTooltipLines.join("   ");
};

const getPurchaseDropdownContent = (purchaseDetails: PurchaseFields) => {
    let ddContent = "Billname: " + purchaseDetails.billName + "; ";
    ddContent += purchaseDetails.amount !== undefined ? "Amount: " + purchaseDetails.amount + "; " : "";
    const purchasedDateInstance = getDateInstance(purchaseDetails.purchaseDate);
    ddContent += "Purchase Date: " + formatTimestamp(purchasedDateInstance, "MM-DD-YYYY");

    return ddContent;
};

export const PurchaseRefundForm: FunctionComponent<PurchaseRefundFormProps> = (props) => {
    const [billName, setBillName] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState(props.refundDetails?.description || '');
    const [refundDate, setRefundDate] = useState(new Date());
    const [tags, setTags] = useState<string[]>(props.refundDetails?.tags || []);
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.refundDetails?.receipts || []);
    const [dropdownPymtAccountItems, setDropdownPymtAccountItems] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPymtAccount, setSelectedDropdownPymtAccount] = useState<DropDownItemType>();
    const [purchaseDetailList, setPurchaseDetailList] = useState<PurchaseFields[]>([]);
    const [dropdownPurchaseDetailList, setDropdownPurchaseDetailList] = useState<DropDownItemType[]>([]);
    const [selectedDropdownPurchaseDetail, setSelectedDropdownPurchaseDetail] = useState<DropDownItemType>();
    const [selectedPurchaseReference, setSelectedPurchaseReference] = useState<PurchaseDetailReference>();
    const [purchaseListPageNo, setPurchaseListPageNo] = useState<number>(1);
    const [dropdownRefundReasons, setDropdownRefundReasons] = useState<DropDownItemType[]>([]);
    const [selectedDropdownReason, setSelectedDropdownReason] = useState<DropDownItemType>();
    const [selectedSharePersonTagItems, setSelectedSharePersonTagItems] = useState<TagObject[]>([]);
    const [sourceSharePersonTagItems, setSourceSharePersonTagItems] = useState<TagObject[]>([]);
    const [defaultCurrencyProfile, setDefaultCurrencyProfile] = useState<CurrencyProfileResource>(props.currencyProfiles[0]);
    const navigate = useNavigate();


    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);

        let purchasePymtAccId: string | undefined = undefined;
        logger.debug("props.purchaseDetails =", props.purchaseDetails, " is selected as default purchase for refund.");
        if (props.purchaseDetails) {
            const myDdPurchaseDetail = {
                id: props.purchaseDetails.id,
                content: getPurchaseDropdownContent(props.purchaseDetails),
                tooltip: getPurchaseDropdownTooltip(props.purchaseDetails)
            };
            setSelectedDropdownPurchaseDetail(myDdPurchaseDetail);
            setDropdownPurchaseDetailList([myDdPurchaseDetail]);
            const prchDtl = props.purchaseDetails;
            setPurchaseDetailList([prchDtl]);
            const spObj = props.sharePersons.reduce((prev: Record<string, string>, curr) => {
                prev[curr.id] = curr.nickName || `${curr.firstName} ${curr.lastName}`;
                return prev;
            }, {});
            setSelectedPurchaseReference({
                billName: props.purchaseDetails.billName,
                amount: props.purchaseDetails.amount || "-",
                paymentAccountName: props.purchaseDetails.paymentAccountName || "-",
                purchaseId: props.purchaseDetails.id,
                purchaseItemId: null,
                taggingPersons: props.purchaseDetails.personIds.map(pid => spObj[pid]).filter(sp => sp)
            });
            logger.debug("refund amount =", props.refundDetails?.amount, ", and amount =", amount, " purchase amount =", props.purchaseDetails.amount);
            setAmount(prev => {
                if (props.refundDetails?.amount) {
                    return props.refundDetails.amount;
                } else if (props.purchaseDetails?.amount && amount === "" && props.refundDetails?.amount === undefined) {
                    logger.debug("setting refund amount same as purchase amount");
                    return props.purchaseDetails.amount;
                }
                return prev;
            });
            logger.debug("refund billname =", props.refundDetails?.billName, ", and billname =", billName, " purchase billname =", props.purchaseDetails.billName);
            setBillName(prev => {
                if (props.refundDetails?.billName) {

                    logger.debug("setting refund billname as " + "Refund for " + props.refundDetails.billName);
                    return props.refundDetails.billName;
                } else if (props.purchaseDetails && billName === "") {
                    logger.debug("setting refund billname as " + "Refund for " + props.purchaseDetails.billName);
                    return "Refund for " + props.purchaseDetails.billName;
                }
                logger.debug("not changing refund billname " + prev);
                return prev;
            });
            logger.debug("refund pymtAccId =", props.refundDetails?.paymentAccountId, " purchase pymtAccId =", props.purchaseDetails.paymentAccountId, "will configure selected pymtAcc if possible.");
            purchasePymtAccId = props.purchaseDetails.paymentAccountId;

        } else {
            setTimeout(() => {
                loadMorePurchaseList();
            }, 300);
        }

        setRefundDate(prev => {
            if (props.refundDetails?.refundDate) {
                return getDateInstance(props.refundDetails.refundDate);
            }
            return prev;
        });

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
            return {
                id: reasonCfg.id,
                content: reasonCfg.name,
                tooltip: reasonCfg.description
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
        if (!selectedDropdownPymtAccount) {
            // this never gets called because it is required, but due to compilation added if condition
            throw new Error("pymt acc is not selected");
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
            paymentAccountId: selectedDropdownPymtAccount.id,
            paymentAccountName: selectedDropdownPymtAccount.content,
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
            personIds: selectedSharePersonTagItems.map(sspt => sspt.id),
            currencyProfileId: defaultCurrencyProfile.id
        };

        Object.entries(data).forEach((entry) => {
            const key = entry[0];
            let value = entry[1];
            if (value instanceof Date) value = formatTimestamp(value);
            else if (typeof value === "object") value = JSON.stringify(value);
            logger.debug("added to form, key=", key, ", value =", value);
            if (value !== undefined) {
                formData.append(key, value);
            }
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
        if (purchaseDetailList.length > MAX_ALLOWED_PURCHASE_DROPDOWN_ITEMS) {
            return;
        }
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

    const onSelectPurchaseHandler = (selectedPurchase?: DropDownItemType) => {
        const logger = getLogger("onSelectPurchaseHandler", fcLogger);
        setSelectedDropdownPurchaseDetail(selectedPurchase);
        const matchedPurchse = purchaseDetailList.find(prch => prch.id === selectedPurchase?.id);
        logger.debug("selectedPurchase=", selectedPurchase, "; matchedPurchse=", matchedPurchse);
        setAmount(prev => {
            if (!prev) {
                if (matchedPurchse?.amount) {
                    return matchedPurchse.amount;
                }
            }
            return prev;
        });
        setBillName(prev => {
            if (!prev) {
                if (matchedPurchse?.billName) {
                    return "Refund for " + matchedPurchse.billName;
                }
            }
            return prev;
        });
        setSelectedDropdownPymtAccount(prev => {
            if (!prev) {
                const pymtAccForSelectedPurchase = dropdownPymtAccountItems.find(pymtacc => (pymtacc.id === matchedPurchse?.paymentAccountId));
                if (pymtAccForSelectedPurchase) {
                    return pymtAccForSelectedPurchase;
                }
            }
            return prev;
        });


        if (matchedPurchse) {
            const spObj = props.sharePersons.reduce((prev: Record<string, string>, curr) => {
                prev[curr.id] = curr.nickName || `${curr.firstName} ${curr.lastName}`;
                return prev;
            }, {});

            setSelectedPurchaseReference({
                billName: matchedPurchse.billName,
                amount: matchedPurchse.amount || "-",
                paymentAccountName: matchedPurchse.paymentAccountName || "-",
                purchaseId: matchedPurchse.id,
                purchaseItemId: null,
                taggingPersons: matchedPurchse.personIds.map(pid => spObj[pid]).filter(sp => sp)
            });
        } else {
            setSelectedPurchaseReference(undefined);
        }
    };

    function cacheReceiptFileHandler (receipt: ReceiptProps, cacheAction: CacheAction): Promise<DownloadReceiptResource> {
        return receiptService.cacheReceiptFile(receipt, cacheAction) as Promise<DownloadReceiptResource>;
    }

    function downloadReceiptsHandler (receipts: ReceiptProps[]): Promise<DownloadReceiptResource[]> {
        return receiptService.downloadReceipts(receipts);
    }

    fcLogger.debug("purchaseDetailList.length=", purchaseDetailList.length, "; list=", purchaseDetailList);

    return (
        <div>
            <form onSubmit={ onSubmitHandler }>
                <div className="columns">
                    <div className="column is-narrow">
                        <DropDown
                            id="purchase-dd"
                            label="Purchase: "
                            items={ dropdownPurchaseDetailList }
                            key={ "purchase-dd" }
                            onSelect={ onSelectPurchaseHandler }
                            direction="down"
                            selectedItem={ selectedDropdownPurchaseDetail }
                            defaultItem={ selectedDropdownPurchaseDetail }
                            loadMore={ loadMorePurchaseList }
                            allowSearch={ true }
                        />
                    </div>
                    <div className="column">
                        <div className="block"></div>
                        <ViewDialog
                            linkText="quickview"
                            openDefault={ false }
                            loading={ !selectedPurchaseReference }
                            title="Selected Purchase Details"
                            animateLink={ true }
                            isLinkPlayIn={ !!selectedPurchaseReference }
                        >
                            <div className="block">
                                <label>BillName: </label> <span>{ selectedPurchaseReference?.billName }</span>
                            </div>
                            <div className="block">
                                <label>Amount: </label> <span>{ selectedPurchaseReference?.amount }</span>
                            </div>
                            <div className="block">
                                <label>Payment Account: </label> <span>{ selectedPurchaseReference?.paymentAccountName }</span>
                            </div>
                            <div className="block">
                                <label>Tag Persons: </label> <ul>{ selectedPurchaseReference?.taggingPersons.map(sp => (<li>{ sp }</li>)) }</ul>
                            </div>
                        </ViewDialog>
                    </div>
                </div>
                <div className="columns">
                    <div className="column">
                        <div className="columns">
                            <div className="column">
                                {
                                    !billName &&
                                    <Input
                                        id="refund-bill-name-empty"
                                        key="refund-bill-name-empty"
                                        label="Bill Name: "
                                        type="text"
                                        placeholder="Enter Refund billName"
                                        size={ 20 }
                                        initialValue={ billName }
                                        tooltip="It could be store name, online site or specific product. Have short name that you can recognize"
                                        leftIcon={ faStore }
                                        onChange={ setBillName }
                                        required={ true }
                                        maxlength={ 50 }
                                        minlength={ 2 }
                                    />
                                }
                                {
                                    billName &&
                                    <Input
                                        id="refund-bill-name"
                                        key={ "refund-bill-name" }
                                        label="Bill Name: "
                                        type="text"
                                        placeholder="Enter Refund billName"
                                        size={ 20 }
                                        initialValue={ billName }
                                        tooltip="It could be store name, online site or specific product. Have short name that you can recognize"
                                        leftIcon={ faStore }
                                        onChange={ setBillName }
                                        required={ true }
                                        maxlength={ 50 }
                                        minlength={ 2 }
                                    />
                                }
                                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ !!selectedPurchaseReference } animateOnMount={ true } isVisibleAfterAnimateOut={ false } >
                                    <pre>
                                        <span className="icon-text">
                                            <span className="icon"> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                                            <span> selected purchase's billName: { selectedPurchaseReference?.billName } </span>
                                        </span>
                                    </pre>
                                </Animated>
                            </div>
                        </div>
                        <div className="columns">
                            <div className="column is-narrow">
                                <CurrencySymbol
                                    countryCode={ defaultCurrencyProfile.country.code }
                                    countryName={ defaultCurrencyProfile.country.name }
                                    currencyCode={ defaultCurrencyProfile.currency.code }
                                    currencyName={ defaultCurrencyProfile.currency.name }
                                />
                            </div>
                            <div className="column">
                                {
                                    amount &&
                                    <Input
                                        id="refund-amount"
                                        key={ "refund-amount" }
                                        label="Refund Amount: "
                                        type="number"
                                        placeholder="0.00"
                                        min={ -10000000 }
                                        max={ 10000000 }
                                        initialValue={ amount }
                                        leftIcon={ faDollarSign }
                                        className="is-medium"
                                        onChange={ setAmount }
                                        step={ 0.01 }
                                    />
                                }
                                {
                                    !amount &&
                                    <Input
                                        id="refund-amount-empty"
                                        key="refund-amount-empty"
                                        label="Refund Amount: "
                                        type="number"
                                        placeholder="0.00"
                                        min={ -10000000 }
                                        max={ 10000000 }
                                        initialValue={ amount }
                                        leftIcon={ faDollarSign }
                                        className="is-medium"
                                        onChange={ setAmount }
                                        step={ 0.01 }
                                    />
                                }
                                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ !!selectedPurchaseReference } animateOnMount={ true } isVisibleAfterAnimateOut={ false } >
                                    <pre>
                                        <span className="icon-text">
                                            <span className="icon"> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                                            <span>selected purchase's amount { selectedPurchaseReference?.amount }</span>
                                        </span>
                                    </pre>
                                </Animated>
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
                                    required={ true }
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
                                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ !!selectedPurchaseReference } animateOnMount={ true } isVisibleAfterAnimateOut={ false } >
                                    <pre>
                                        <span className="icon-text">
                                            <span className="icon"> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                                            <span>selected purchase's payment account { selectedPurchaseReference?.paymentAccountName || "-" }</span>
                                        </span>
                                    </pre>
                                </Animated>
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
                                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ !!selectedPurchaseReference } animateOnMount={ true } isVisibleAfterAnimateOut={ false } >
                                    <pre>
                                        <span className="icon-text">
                                            <span className="icon"> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                                            <span> selected purchase's tagged persons { selectedPurchaseReference?.taggingPersons.join(" , ") } </span>
                                        </span>
                                    </pre>
                                </Animated>
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
                                <Animated animatedIn="flipInX" animatedOut="flipOutX" isPlayIn={ !!selectedPurchaseReference } animateOnMount={ true } isVisibleAfterAnimateOut={ false } >
                                    <pre>
                                        <span className="icon-text">
                                            <span className="icon"> <FontAwesomeIcon icon={ faInfoCircle } /> </span>
                                            <span> the selected purchase's tags will auto apply in dashboard total. No need to add same tags here. </span>
                                        </span>
                                    </pre>
                                </Animated>
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
                <div className="columns is-hidden-mobile">
                    <div className="column">
                        <div className="buttons">
                            <button className="button is-light" type="button" onClick={ onCancelHandler }>
                                <span className="px-2-label">
                                    Cancel
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons is-centered">
                            <button className="button is-dark is-medium" type="submit">
                                <span className="px-2-label">
                                    { props.submitLabel }
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="columns is-hidden-desktop">
                    <div className="column">
                        <div className="buttons is-right">
                            <button className="button is-dark" type="submit">
                                <span className="px-2-label">
                                    { props.submitLabel }
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="column">
                        <div className="buttons">
                            <button className="button is-light" type="button" onClick={ onCancelHandler }>
                                <span className="px-2-label">
                                    Cancel
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="column"></div>
                </div>
            </form >
        </div >
    );
};
