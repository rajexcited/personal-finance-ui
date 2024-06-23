import "bulma-carousel/dist/css/bulma-carousel.min.css";
import "./view-receipts.css";
import { FunctionComponent, MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import bulmaCaraosel, { BulmaCarouselOptions } from "bulma-carousel";
import { ExpenseService, ReceiptProps } from "../../services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";
import { ReceiptType } from "../../services/field-types";
import { LoadSpinner } from "../../../../components";
import ReactMarkdown from "react-markdown";
import { getLogger } from "../../../../services";


interface ViewReceiptsProps {
    receipts: ReceiptProps[];
    isShow: boolean;
    onHide (): void;
}

const defaultOptions: BulmaCarouselOptions = {
    autoplay: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
};

const allowedScales = [0.125, 0.25, 0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const findNextScaleValue = (scale: number, findBigger: boolean) => {
    const scaleIndex = allowedScales.findIndex(sc => sc === scale);
    if (scaleIndex === -1) return 1;
    const newScaleIndex = scaleIndex + (findBigger ? 1 : -1);
    if (newScaleIndex >= 0 && newScaleIndex < allowedScales.length)
        return allowedScales[newScaleIndex];
    return scale;
};
const expenseService = ExpenseService();
const fcLogger = getLogger("FC.ViewReceipts", null, null, "INFO");
const ViewReceipts: FunctionComponent<ViewReceiptsProps> = props => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [receipts, setReceipts] = useState(props.receipts);
    const [isModalOpen, setModalOpen] = useState(props.isShow);
    const [scaleValue, setScaleValue] = useState(1);
    const [isActiveItemImage, setActiveItemImage] = useState(false);
    const [isReceiptLoading, setReceiptLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [receiptCarousel, setReceiptCarousel] = useState<bulmaCaraosel>();

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

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);
        logger.info("initialized component, props.receipts =", props.receipts);

        if (props.receipts.length > 0) {
            setReceiptLoading(true);
            expenseService.downloadReceipts([props.receipts[0]])
                .then(downloadReceipts => {
                    logger.info("receipt is downloaded. downloadReceipts =", { ...downloadReceipts[0] });
                    if (downloadReceipts[0].status === "success") {
                        const propReceipts = [...props.receipts];
                        propReceipts[0] = {
                            ...propReceipts[0],
                            url: downloadReceipts[0].url
                        };
                        setReceipts(propReceipts);
                    } else {
                        setErrorMessage(downloadReceipts[0].error);
                    }
                    setReceiptLoading(false);
                });
        }


        return () => {
            logger.debug("destroying component, removing bulma wrapper");

            receiptCarousel?.wrapper.remove();
            logger.info("destroyed component, removed bulma wrapper");
        };
    }, []);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[receiptCarousel]", fcLogger);
        logger.info("initialized receiptCarousel", receiptCarousel);

        receiptCarousel?.on("show", (carousel: bulmaCaraosel) => {
            logger.info("on show event is emitted, slide index =", carousel.state.next, ", receipt =", receipts[carousel.state.next]);
            const isImageType = receipts[carousel.state.next].contentType !== ReceiptType.PDF;

            logger.info("isImageType =", isImageType, ", scale = 1, receiptLoading = true, downloading receipt");
            setActiveItemImage(isImageType);
            setScaleValue(1);
            setReceiptLoading(true);
            setErrorMessage("");
            const receiptToShow = receipts[carousel.state.next];
            expenseService.downloadReceipts([receiptToShow])
                .then(downloadReceipts => {
                    const downloadedReceiptResult = downloadReceipts[0];
                    logger.info("receipt is downloaded. downloadReceipts =", downloadedReceiptResult);
                    if (downloadedReceiptResult.status === "success") {
                        setReceipts(prev => {
                            const unchangedList = prev.filter(r => r.id !== receiptToShow.id);
                            const updatedReceipt = { ...receiptToShow, url: downloadedReceiptResult.url };
                            return [...unchangedList, updatedReceipt];
                        });

                    } else {
                        setErrorMessage(downloadedReceiptResult.error);
                    }
                    setReceiptLoading(false);
                });
        });

        return () => {
            logger.info("destroyed, removed event");
        };
    }, [receiptCarousel]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[carouselRef.current]", fcLogger);
        logger.info("initialized ref element", carouselRef.current, receiptCarousel);

        if (!carouselRef.current || receiptCarousel) return;
        const options = {
            ...defaultOptions
        };

        logger.debug("initializing bulma carousel wrapper");
        const carousell = new bulmaCaraosel(carouselRef.current, options);

        logger.debug("setting carousel instance");
        setReceiptCarousel(carousell);

        return () => {
            logger.info("ref element changed, destroying");
        };
    }, [carouselRef.current]);

    useEffect(() => {
        if (isModalOpen) document.documentElement.classList.add("is-clipped");
        else document.documentElement.classList.remove("is-clipped");
    }, [isModalOpen]);

    const onClickZoomInHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setScaleValue(prev => findNextScaleValue(prev, true));
    };

    const onClickZoomOutHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setScaleValue(prev => findNextScaleValue(prev, false));
    };

    const onClickModalCloseHandler: MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        setModalOpen(false);
        props.onHide();
    };

    const scaleTooltip = "current scale: " + (scaleValue * 100).toFixed(2) + "%";
    const nextScaleTooltip = !!nextScaleValue ? "next zoom In: " + nextScaleValue + ". " : "cannot zoom in anymore.";
    const prevScaleTooltip = !!previousScaleValue ? "previous zoom out: " + previousScaleValue + ". " : "cannot zoom out anymore.";

    return (
        <section className="section view-receipts-carousel">
            <div className={ `modal ${isModalOpen ? "is-active" : ""}` }>
                <div className="modal-background"></div>
                <div className="modal-card is-fullscreen">
                    <section className="modal-card-body">
                        <div className="modal-close">
                            <button className="delete" type="button" onClick={ onClickModalCloseHandler } />
                        </div>
                        { isActiveItemImage &&
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
                        <LoadSpinner loading={ isReceiptLoading } insideModal={ true } />
                        <div className="carousel" ref={ carouselRef }>
                            {
                                receipts.map((rct: ReceiptProps, ind: number) =>
                                    <div className={ `item-${ind + 1}` } key={ rct.id }>
                                        <div className="fullscreen-image-container">
                                            { !isReceiptLoading && (rct.contentType === ReceiptType.JPEG || rct.contentType === ReceiptType.PNG) &&
                                                <figure className="image">
                                                    <img src={ rct.url } alt={ rct.name } style={ { transform: "scale(" + scaleValue + ")" } } />
                                                </figure>
                                            }
                                            {
                                                !isReceiptLoading && rct.contentType === ReceiptType.PDF &&
                                                <embed src={ rct.url } type={ rct.contentType } height={ "99%" } width={ "93%" } />
                                            }
                                            { !isReceiptLoading && !!errorMessage &&
                                                <article className="message is-danger error">
                                                    <div className="message-body">
                                                        <ReactMarkdown children={ errorMessage } />
                                                    </div>
                                                </article>
                                            }
                                            {
                                                isReceiptLoading &&
                                                <article className="message is-info">
                                                    <div className="message-body">
                                                        Please wait receipt is loading.
                                                    </div>
                                                </article>
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            {
                                receipts.length === 0 &&
                                <div className="item-1">  <span>  Dummy item One </span>   </div>
                            }
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default ViewReceipts;