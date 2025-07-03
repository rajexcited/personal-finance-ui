import "./upload-receipts.css";
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus, faSpinner, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState, MouseEventHandler, useMemo, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import { CacheAction, DownloadReceiptResource, ReceiptProps, ReceiptType } from "./field-types";
import { getLogger, testAttributes } from "../../shared";
import { ExpenseBelongsTo } from "../../pages/expenses/services";

interface UploadReceiptsModalProps {
    receipts: ReceiptProps[],
    relationId: string;
    onChange (receipts: ReceiptProps[]): void;
    cacheReceiptFile (receipt: ReceiptProps, cacheAction: CacheAction): Promise<DownloadReceiptResource>;
    downloadReceipts (receipts: ReceiptProps[]): Promise<DownloadReceiptResource[]>;
    belongsTo: ExpenseBelongsTo;
}

const allowedScales = [0.125, 0.25, 0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const findNextScaleValue = (scale: number, findBigger: boolean) => {
    const scaleIndex = allowedScales.findIndex(sc => sc === scale);
    if (scaleIndex === -1) return 1;
    const newScaleIndex = scaleIndex + (findBigger ? 1 : -1);
    if (newScaleIndex >= 0 && newScaleIndex < allowedScales.length)
        return allowedScales[newScaleIndex];
    return scale;
};

const fcLogger = getLogger("FC.UploadReceiptsModal", null, null, "DISABLED");

interface LoadingReceiptProps extends ReceiptProps {
    isLoading: boolean;
    errorMessage: string;
}

const receiptTypeValues = Object.values(ReceiptType);
const getValidType = (receiptFileType: string) => {
    return receiptTypeValues.find(rtv => rtv === receiptFileType);
};

export const UploadReceiptsModal: FunctionComponent<UploadReceiptsModalProps> = (props) => {
    const [receipts, setReceipts] = useState<LoadingReceiptProps[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [fullscreenReceipt, setFullscreenReceipt] = useState<ReceiptProps>();
    const [errorMessage, setErrorMessage] = useState("");
    const [scaleValue, setScaleValue] = useState(1);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        logger.debug("initialized component");
        setReceipts(() => props.receipts.map(rct => ({ ...rct, isLoading: true, errorMessage: "" })));
        return () => {
            logger.debug("destroyed along with temp blob urls, so file memory will not be leaked");
        };
    }, []);

    const nextScaleValue = useMemo(() => {
        const next = findNextScaleValue(scaleValue, true);
        if (next === scaleValue) return "";
        return (next * 100).toFixed(2) + "%";
    }, [scaleValue]);

    const previousScaleValue = useMemo(() => {
        const prev = findNextScaleValue(scaleValue, false);
        if (prev === scaleValue) return "";
        return (prev * 100).toFixed(2) + "%";
    }, [scaleValue]);

    const onClickZoomInHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setScaleValue(prev => findNextScaleValue(prev, true));
    };

    const onClickZoomOutHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setScaleValue(prev => findNextScaleValue(prev, false));
    };

    const validateAndCacheReceipts = async (files: FileList | null, tempReceipts: LoadingReceiptProps[]) => {
        const logger = getLogger("validateAndCacheReceipts", fcLogger);
        const supportedReceipts: LoadingReceiptProps[] = [];
        const unsupportedReceiptFiles: LoadingReceiptProps[] = [];
        logger.info("how many file? ", files?.length, ", files =", files);
        const tempReceiptsMap: Record<string, LoadingReceiptProps> = {};
        tempReceipts.forEach(rct => {
            tempReceiptsMap[rct.name] = rct;
        });
        if (!!files?.length)
            for (const file of files) {
                const fileType = getValidType(file.type);
                const receipt = tempReceiptsMap[file.name];
                try {
                    if (!fileType) {
                        unsupportedReceiptFiles.push(receipt);
                        continue;
                    }

                    logger.debug("fileType =", fileType, ", name =", file.name, "lastModified =", file.lastModified, "byte size =", file.size);

                    const cachedReceiptResponse = await props.cacheReceiptFile(receipt, CacheAction.AddUpdateGet);
                    supportedReceipts.push({
                        ...receipt,
                        ...cachedReceiptResponse
                    });
                } catch (e) {
                    logger.log("unsupported file", e);
                    unsupportedReceiptFiles.push(receipt);
                }
            }
        logger.info("supportedReceipts =", [...supportedReceipts], ", unsupportedReceiptFiles =", [...unsupportedReceiptFiles]);
        return {
            supportedReceipts,
            unsupportedReceiptFiles
        };
    };

    const addReceiptsTempDetails = (files: FileList | null) => {
        const logger = getLogger("addReceiptsTempDetails", fcLogger);
        const tempReceipts: LoadingReceiptProps[] = [];
        if (!!files?.length) {
            for (const file of files) {
                tempReceipts.push({
                    name: file.name,
                    id: uuidv4(),
                    file,
                    contentType: file.type as ReceiptType,
                    relationId: props.relationId,
                    belongsTo: props.belongsTo,
                    isLoading: true,
                    errorMessage: ""
                });
            }
        }
        return tempReceipts;
    };

    const onChangeFileUploadHandler: React.ChangeEventHandler<HTMLInputElement> = async event => {
        event.preventDefault();
        const logger = getLogger("onChangeFileUploadHandler", fcLogger);
        // update receipts list with temp details
        const tempReceipts = addReceiptsTempDetails(event.target.files);
        setReceipts(prev => {
            return [...prev, ...tempReceipts];
        });
        // validate uploaded receipt
        logger.debug("pre-processing upload receipt file", event, event.target, event.target.files);
        validateAndCacheReceipts(event.target.files, tempReceipts).then(processedReceipts => {
            // if all valid, cache and update view
            setReceipts(prevlist => {
                const supportedReceiptMap: Record<string, LoadingReceiptProps> = {};
                const unsupportedReceiptMap: Record<string, LoadingReceiptProps> = {};
                processedReceipts.supportedReceipts.forEach(sprtRct => {
                    supportedReceiptMap[sprtRct.id] = sprtRct;
                });
                processedReceipts.unsupportedReceiptFiles.forEach(unsprtRct => {
                    unsupportedReceiptMap[unsprtRct.id] = unsprtRct;
                });
                const newReceipts = prevlist.map(prevrct => {
                    if (supportedReceiptMap[prevrct.id]) {
                        return { ...supportedReceiptMap[prevrct.id], isLoading: false } as LoadingReceiptProps;
                    }
                    if (unsupportedReceiptMap[prevrct.id]) {
                        return { ...unsupportedReceiptMap[prevrct.id], errorMessage: "Not supported. Hence, the system cannot accept." } as LoadingReceiptProps;
                    }
                    return prevrct;
                });
                Promise.resolve(newReceipts)
                    .then(rcts => {
                        props.onChange(rcts.filter(rct => !rct.isLoading && !rct.errorMessage).map(rct => ({ ...rct })));
                    });
                return newReceipts;
            });
            // if invalid, show error message
            let msg = "";
            if (processedReceipts.unsupportedReceiptFiles.length) {
                const errorFileList = processedReceipts.unsupportedReceiptFiles.map(ff => ff.name);
                const toBeForm = errorFileList.length > 1 ? " are not" : " is not";
                msg = errorFileList.join(",")
                    + toBeForm
                    + " supported. Hence, the system cannot accept.";
            }
            setErrorMessage(msg);
        });
    };

    const onClickUploadFileRemoveHandler = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, receiptToBeRemoved: ReceiptProps) => {
        event.preventDefault();
        setReceipts(prev => {
            const newReceipts = [...prev.filter(itm => itm.id !== receiptToBeRemoved.id)];
            props.onChange(newReceipts);
            return newReceipts;
        });
        await props.cacheReceiptFile(receiptToBeRemoved, CacheAction.Remove);
    };

    const onClickModalOpenHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setReceipts(prev => prev.map(rct => ({ ...rct, isLoading: true })));
        props.downloadReceipts(receipts).then((downloadedReceipts) => {
            const logger = getLogger("downloadReceipts.resolves", fcLogger);
            logger.debug("downloaded ", downloadedReceipts.length, "receipts");
            const failedMessages = downloadedReceipts.map(dr => (dr.status === "fail" && dr.error) || "").filter(r => r);
            if (failedMessages.length > 0) {
                logger.debug("failedMessages=", failedMessages);
                setErrorMessage(failedMessages.join("\n"));
            }
            if (failedMessages.length !== downloadedReceipts.length) {
                logger.debug("failedMessages.length and downloadedReceipts.length are not same", failedMessages.length, downloadedReceipts.length);
                setReceipts(rcts =>
                    rcts.map(rct => {
                        const downloaded = downloadedReceipts.find(dr => dr.id === rct.id);
                        logger.debug("downloaded result", downloaded);
                        if (downloaded?.status === "success") {
                            return { ...rct, url: downloaded.url, isLoading: false };
                        }
                        return { ...rct };
                    })
                );
            }
        });
        setModalOpen(true);
        document.documentElement.classList.add("is-clipped");
    };

    const onClickModalCloseHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setModalOpen(false);
        document.documentElement.classList.remove("is-clipped");
    };

    const onClickHideFullscreenImageHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setFullscreenReceipt(undefined);
    };

    const onClickShowFullscreenImageHandler: MouseEventHandler<HTMLImageElement> = event => {
        event.preventDefault();
        const target = event.target as HTMLImageElement;
        const receipt = props.receipts.find(rct => rct.url === target.src);
        setFullscreenReceipt(receipt);
        setScaleValue(1);
    };

    const onClickShowFullscreenHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, receipt: ReceiptProps) => {
        event.preventDefault();
        setFullscreenReceipt(receipt);
    };

    const scaleTooltip = " current scale: " + (scaleValue * 100).toFixed(2) + "%";
    const nextScaleTooltip = !!nextScaleValue ? "next zoom In: " + nextScaleValue : "cannot zoom in anymore.";
    const prevScaleTooltip = !!previousScaleValue ? "previous zoom out: " + previousScaleValue : "cannot zoom out anymore.";
    const validReceiptSize = receipts.filter(rct => !rct.errorMessage).length;
    const invalidReceiptSize = receipts.length - validReceiptSize;
    fcLogger.debug("all receipts = ", receipts.map(r => ({ ...r })), "validReceiptSize=", validReceiptSize, "invalidReceiptSize=", invalidReceiptSize);

    return (
        <section className="upload-receipts-section">
            <div className="form-field">
                <button className="button is-light is-link" type="button" onClick={ onClickModalOpenHandler }
                    { ...testAttributes("container-open-action") }                >
                    Upload { validReceiptSize > 0 ? "/ View" : "" } Receipt(s)</button>
                { validReceiptSize > 0 &&
                    <span className="subtitle" { ...testAttributes("valid-receipt-message") }> { validReceiptSize } uploaded</span>
                }
                {
                    validReceiptSize > 0 && invalidReceiptSize > 0 &&
                    <span className="subtitle">,</span>
                }
                { invalidReceiptSize > 0 &&
                    <span className="subtitle" { ...testAttributes("invalid-receipt-message") }> { invalidReceiptSize } invalid and skipped.</span>
                }
                { receipts.length === 0 &&
                    <span className="subtitle" { ...testAttributes("no-receipt-message") }>No receipt uploaded</span>
                }
            </div>
            <div className={ `fullscreen-image-container modal ${fullscreenReceipt ? "is-active" : ""}` }>
                <div className="modal-close">
                    <button className="delete" type="button"
                        onClick={ onClickHideFullscreenImageHandler }
                        { ...testAttributes("hide-fullscreen") }></button>
                </div>
                {
                    fullscreenReceipt && fullscreenReceipt.contentType !== ReceiptType.PDF &&
                    <div className="modal-card-header-actions">
                        <button className="button is-white is-inverted image-zoomIn" type="button" onClick={ onClickZoomInHandler } { ...testAttributes("image-zoomin") }>
                            <span className="icon tooltip is-tooltip-left" data-tooltip={ nextScaleTooltip + scaleTooltip } >
                                <FontAwesomeIcon icon={ faMagnifyingGlassPlus } size="1x" />
                            </span>
                        </button>
                        <button className="button is-white is-inverted image-zoomOut" type="button" onClick={ onClickZoomOutHandler } { ...testAttributes("image-zoomout") }>
                            <span className="icon tooltip is-tooltip-left" data-tooltip={ prevScaleTooltip + scaleTooltip }>
                                <FontAwesomeIcon icon={ faMagnifyingGlassMinus } />
                            </span>
                        </button>
                    </div>
                }
                {
                    fullscreenReceipt && (fullscreenReceipt.contentType === ReceiptType.JPEG || fullscreenReceipt.contentType === ReceiptType.PNG) &&
                    <figure className="image" { ...testAttributes("image", "receipt-type", fullscreenReceipt.contentType) }>
                        <img src={ fullscreenReceipt.url } alt={ fullscreenReceipt.name } style={ { transform: "scale(" + scaleValue + ")" } } />
                    </figure>
                }
                {
                    fullscreenReceipt && fullscreenReceipt.contentType === ReceiptType.PDF &&
                    <embed src={ fullscreenReceipt.url } type={ fullscreenReceipt.contentType } height={ "99%" } width={ "93%" } { ...testAttributes("pdf", "receipt-type", fullscreenReceipt.contentType) } />
                }
            </div>
            <div className={ `modal ${isModalOpen ? "is-active" : ""}` }>
                <div className="modal-background"></div>
                <div className="modal-card is-fullscreen">
                    <header className="modal-card-head">
                        <p className="modal-card-title" { ...testAttributes("container-header-title") }>View / Upload Purchase Receipts</p>
                        <button className="delete" type="button" aria-label="close"
                            onClick={ onClickModalCloseHandler }
                            { ...testAttributes("container-header-close-action") }></button>
                    </header>
                    <section className="modal-card-body">
                        <div className={ `file ${!!errorMessage ? "is-danger" : ""}` }>
                            <label className="file-label" { ...testAttributes("file-receipts") }>
                                <input
                                    id="file-receipts"
                                    name="file-receipts"
                                    className="file-input"
                                    type="file"
                                    multiple={ true }
                                    accept=".jpg,.png,.jpeg,.pdf"
                                    onChange={ onChangeFileUploadHandler }
                                />
                                <span className="file-cta">
                                    <span className="file-icon">
                                        <FontAwesomeIcon icon={ faUpload } size="lg" />
                                    </span>
                                    <span className="file-label">
                                        Upload receipt(s)
                                    </span>
                                </span>
                            </label>
                            { !!errorMessage &&
                                <article className="message is-danger error" { ...testAttributes("receipt-select-error") }>
                                    <div className="message-body">
                                        <ReactMarkdown children={ errorMessage } />
                                    </div>
                                </article>
                            }
                        </div>
                        <p>&nbsp;</p>
                        <div className="columns">
                            {
                                receipts.map(rct =>
                                    <div className="column" key={ "receipt-view-" + rct.id }>
                                        <article className="message is-light" key={ rct.id } { ...testAttributes("receipt-view", "receipt-filename", rct.name) }>
                                            <div className="message-header">
                                                <p { ...testAttributes("receipt-title") }>{ rct.name }</p>
                                                {
                                                    !rct.isLoading &&
                                                    <button className="button tooltip" type="button" onClick={ e => onClickShowFullscreenHandler(e, rct) } data-tooltip="View Fullscreen" { ...testAttributes("receipt-fullscreen-view-action") }>View</button>
                                                }
                                                <button className="delete" aria-label="delete" onClick={ e => onClickUploadFileRemoveHandler(e, rct) }
                                                    { ...testAttributes("receipt-delete-action") }></button>

                                            </div>
                                            <div className="message-body">
                                                {
                                                    rct.isLoading &&
                                                    <div className="has-text-centered receipt-loading"
                                                        { ...testAttributes("download-receipt", "receipt-name", rct.name) }
                                                    >
                                                        <span className="icon">
                                                            <FontAwesomeIcon icon={ faSpinner } className="fa-pulse" />
                                                        </span>
                                                    </div>
                                                }
                                                {
                                                    rct.errorMessage &&
                                                    <article className="message is-danger error" { ...testAttributes("unsupported-receipt") }>
                                                        <div className="message-body">
                                                            <ReactMarkdown children={ rct.errorMessage } />
                                                        </div>
                                                    </article>
                                                }
                                                {
                                                    !rct.isLoading && rct.contentType !== ReceiptType.PDF &&
                                                    <figure className="image is-height-256" { ...testAttributes("receipt-fullscreen") }>
                                                        <img src={ rct.url } alt={ rct.name } onClick={ onClickShowFullscreenImageHandler } />
                                                    </figure>
                                                }
                                                {
                                                    !rct.isLoading && rct.contentType === ReceiptType.PDF &&
                                                    <embed height={ 256 }
                                                        src={ rct.url + "#toolbar=0" }
                                                        type={ rct.contentType }
                                                        { ...testAttributes("receipt-fullscreen") }
                                                    />
                                                }
                                            </div>
                                        </article>
                                    </div>
                                )
                            }
                        </div>
                        { !receipts.length &&
                            <p className="subtitle" { ...testAttributes("container-no-receipt-message") }>There are no receipts</p>
                        }

                    </section>
                    <footer className="modal-card-foot">
                        <button className="button" type="button" onClick={ onClickModalCloseHandler }
                            { ...testAttributes("container-close-action") }
                        >Close</button>
                    </footer>
                </div>
            </div>
        </section >
    );
};
