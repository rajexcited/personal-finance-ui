import "bulma-carousel/dist/css/bulma-carousel.min.css";
import "./view-receipts.css";
import { FunctionComponent, MouseEventHandler, useEffect, useMemo, useRef, useState } from "react";
import bulmaCaraosel, { BulmaCarouselOptions } from "bulma-carousel";
import { ReceiptProps } from "../../services";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassMinus, faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";
import { ReceiptType } from "../../services/field-types";


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

const ViewReceipts: FunctionComponent<ViewReceiptsProps> = props => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setModalOpen] = useState(props.isShow);
    const [scaleValue, setScaleValue] = useState(1);
    const [isActiveItemImage, setActiveItemImage] = useState(false);

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
        if (!carouselRef.current) return;
        const options = {
            ...defaultOptions
        };
        if (isModalOpen) document.documentElement.classList.add("is-clipped");
        const carousell = new bulmaCaraosel(carouselRef.current, options);
        const isImageType = props.receipts[0]?.fileType !== ReceiptType.PDF;
        setActiveItemImage(isImageType);

        carousell.on("show", (carousel: bulmaCaraosel) => {
            const isImageType = props.receipts[carousel.state.next].fileType !== ReceiptType.PDF;
            setActiveItemImage(isImageType);
            setScaleValue(1);
        });

        return () => {
            carousell.wrapper.remove();
        };
    }, []);

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
    const nextScaleTooltip = !!nextScaleValue ? "next zoom In: " + nextScaleValue : "cannot zoom in anymore.";
    const prevScaleTooltip = !!previousScaleValue ? "previous zoom out: " + previousScaleValue : "cannot zoom out anymore.";

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
                        <div className="carousel" ref={ carouselRef }>
                            {
                                props.receipts.map((rct: ReceiptProps, ind: number) =>
                                    <div className={ `item-${ind + 1}` } key={ rct.id }>
                                        <div className="fullscreen-image-container">
                                            { (rct.fileType === ReceiptType.JPEG || rct.fileType === ReceiptType.PNG) &&
                                                <figure className="image">
                                                    <img src={ rct.url } alt={ rct.fileName } style={ { transform: "scale(" + scaleValue + ")" } } />
                                                </figure>
                                            }
                                            {
                                                rct.fileType === ReceiptType.PDF &&
                                                <embed src={ rct.url } type={ rct.fileType } height={ "99%" } width={ "93%" } />
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            {
                                props.receipts.length === 0 &&
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