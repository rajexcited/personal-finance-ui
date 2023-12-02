import "./upload-receipts.css";
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FunctionComponent, useState, MouseEventHandler, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { ReceiptProps } from "../../services";
import { ReceiptType } from "../../services/field-types";

interface UploadReceiptsModalProps {
    receipts: ReceiptProps[],
    onChange (receipts: ReceiptProps[]): void;
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

const UploadReceiptsModal: FunctionComponent<UploadReceiptsModalProps> = (props) => {
    const [receipts, setReceipts] = useState<ReceiptProps[]>(props.receipts);
    const [isModalOpen, setModalOpen] = useState(false);
    const [fullscreenReceipt, setFullscreenReceipt] = useState<ReceiptProps>();
    const [errorMessage, setErrorMessage] = useState("");
    const [scaleValue, setScaleValue] = useState(1);

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

    const preProcessUploadedReceipts = (files: FileList | null) => {
        const supportedReceipts: ReceiptProps[] = [];
        const unsupportedReceiptFiles: File[] = [];
        if (!!files?.length)
            for (const file of files) {
                const fileType = Object.entries(ReceiptType).find(entry => entry[1] === file.type)?.[1];
                try {
                    if (!fileType) {
                        unsupportedReceiptFiles.push(file);
                        continue;
                    }
                    const url = URL.createObjectURL(file);
                    supportedReceipts.push({
                        fileName: file.name,
                        id: uuidv4(),
                        lastUpdatedDate: new Date(file.lastModified),
                        url,
                        file,
                        fileType: fileType
                    });
                } catch (e) {
                    console.log("unsupported file", e);
                    unsupportedReceiptFiles.push(file);
                }
            }
        return {
            supportedReceipts,
            unsupportedReceiptFiles
        };
    };

    const onChangeFileUploadHandler: React.ChangeEventHandler<HTMLInputElement> = async event => {
        event.preventDefault();
        const processedReceipts = preProcessUploadedReceipts(event.target.files);
        setReceipts(prev => {
            const newReceipts = [...prev, ...processedReceipts.supportedReceipts];
            Promise.resolve(newReceipts).then(props.onChange);
            return newReceipts;
        });
        let msg = "";
        if (processedReceipts.unsupportedReceiptFiles.length) {
            const errorFileList = processedReceipts.unsupportedReceiptFiles.map(ff => ff.name);
            const toBeForm = errorFileList.length > 1 ? " are not" : " is not";
            msg = errorFileList.join(",")
                + toBeForm
                + " supported. Hence, the system cannot accept.";
        }
        setErrorMessage(msg);
    };

    const onClickUploadFileRemoveHandler = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, receiptToBeRemoved: ReceiptProps) => {
        event.preventDefault();
        setReceipts(prev => {
            const newReceipts = [...prev.filter(itm => itm.id !== receiptToBeRemoved.id)];
            props.onChange(newReceipts);
            return newReceipts;
        });
    };

    const onClickModalOpenHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
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

    return (
        <section className="upload-receipts-section">
            <div className="form-field">
                <button className="button is-light is-link" type="button" onClick={ onClickModalOpenHandler }>Upload { receipts.length > 0 ? "/ View" : "" } Receipt(s)</button>
                { receipts.length > 0 &&
                    <span className="subtitle"> { receipts.length } receipt file{ receipts.length > 1 ? "s are" : " is" } uploaded </span>
                }
                { receipts.length === 0 &&
                    <span className="subtitle">No receipt uploaded</span>
                }
            </div>
            <div className={ `fullscreen-image-container ${fullscreenReceipt ? "is-active" : ""}` }>
                <div className="modal-close">
                    <button className="delete" type="button" onClick={ onClickHideFullscreenImageHandler }></button>
                </div>
                {
                    fullscreenReceipt && fullscreenReceipt.fileType !== ReceiptType.PDF &&
                    <div className="modal-card-header-actions">
                        <button className="button is-white is-inverted image-zoomIn" type="button" onClick={ onClickZoomInHandler }>
                            <span className="icon tooltip is-tooltip-left" data-tooltip={ nextScaleTooltip + scaleTooltip }>
                                <FontAwesomeIcon icon={ faMagnifyingGlassPlus } size="1x" />
                            </span>
                        </button>
                        <button className="button is-white is-inverted image-zoomOut" type="button" onClick={ onClickZoomOutHandler }>
                            <span className="icon tooltip is-tooltip-left" data-tooltip={ prevScaleTooltip + scaleTooltip }>
                                <FontAwesomeIcon icon={ faMagnifyingGlassMinus } />
                            </span>
                        </button>
                    </div>
                }
                {
                    fullscreenReceipt && (fullscreenReceipt.fileType === ReceiptType.JPEG || fullscreenReceipt.fileType === ReceiptType.PNG) &&
                    <figure className="image">
                        <img src={ fullscreenReceipt.url } alt={ fullscreenReceipt.fileName } style={ { transform: "scale(" + scaleValue + ")" } } />
                    </figure>
                }
                {
                    fullscreenReceipt && fullscreenReceipt.fileType === ReceiptType.PDF &&
                    <embed src={ fullscreenReceipt.url } type={ fullscreenReceipt.fileType } height={ "99%" } width={ "93%" } />
                }
            </div>
            <div className={ `modal ${isModalOpen ? "is-active" : ""}` }>
                <div className="modal-background"></div>
                <div className="modal-card is-fullscreen">
                    <header className="modal-card-head">
                        <p className="modal-card-title">View / Upload Expense Receipts</p>
                        <button className="delete" type="button" aria-label="close" onClick={ onClickModalCloseHandler }></button>
                    </header>
                    <section className="modal-card-body">
                        <div className={ `file ${!!errorMessage ? "is-danger" : ""}` }>
                            <label className="file-label">
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
                                <article className="message is-danger error">
                                    <div className="message-body">{ errorMessage }</div>
                                </article>
                            }
                        </div>
                        <p>&nbsp;</p>
                        <div className="columns">
                            {
                                receipts.map(rct =>
                                    <div className="column" key={ "receipt-view-" + rct.id }>
                                        <article className="message is-light" key={ rct.id }>
                                            <div className="message-header">
                                                <p>{ rct.fileName }</p>
                                                <button className="button tooltip" type="button" onClick={ e => onClickShowFullscreenHandler(e, rct) } data-tooltip="View Fullscreen">View</button>
                                                <button className="delete" aria-label="delete" onClick={ e => onClickUploadFileRemoveHandler(e, rct) }></button>
                                            </div>
                                            <div className="message-body">
                                                {
                                                    rct.fileType !== ReceiptType.PDF &&
                                                    <figure className="image is-height-256">
                                                        <img src={ rct.url } alt={ rct.fileName } onClick={ onClickShowFullscreenImageHandler } />
                                                    </figure>
                                                }
                                                {
                                                    rct.fileType === ReceiptType.PDF &&
                                                    <embed height={ 256 } src={ rct.url + "#toolbar=0" } type={ rct.fileType } />
                                                }
                                            </div>
                                        </article>
                                    </div>
                                )
                            }
                        </div>
                        { !receipts.length &&
                            <p className="subtitle">There are no receipts</p>
                        }

                    </section>
                    <footer className="modal-card-foot">
                        <button className="button" type="button" onClick={ onClickModalCloseHandler }>Close</button>
                    </footer>
                </div>
            </div>
        </section >
    );
};

export default UploadReceiptsModal;
