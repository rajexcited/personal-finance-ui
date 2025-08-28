import { FunctionComponent, useEffect, useState } from "react";
import { getLogger } from "../shared";

interface ScrollResetProps {
    once: boolean;
    children: React.JSX.Element;
}

const fcLogger = getLogger("FC.ScrollReset", null, null, "DISABLED");
/**
 * use to generate unique id by usage
 */
let elementCount = 0;


export const ScrollReset: FunctionComponent<ScrollResetProps> = (props) => {
    const [sectionId, setSectionId] = useState("");

    useEffect(() => {
        const logger = getLogger("useEffect.dep[]", fcLogger);

        elementCount++;
        setSectionId(String(elementCount).padStart(3, "0"));
        logger.debug("elementCount=", elementCount);
    }, []);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[sectionId]", fcLogger);
        if (!sectionId) {
            logger.debug("sectionId =", sectionId);
            return;
        }
        let observer: IntersectionObserver | null = null;
        setTimeout(() => {
            const selector = `#scroll-reset-${sectionId}`;
            const target = document.querySelector(selector);
            if (!target) {
                logger.debug("no target to observe for sectionId=", sectionId, ", selector=", selector);
                return;
            }

            observer = new IntersectionObserver((entries) => {
                logger.debug("entries=", entries);
                if (!entries[0].isIntersecting) {
                    logger.debug("not intersecting, scrolling to target element");
                    //window.scrollTo({ top: 0 });
                    entries[0].target.scrollIntoView();
                    if (props.once) {
                        logger.debug("because of props.once, disconnecting observer");
                        observer?.disconnect();
                    }
                }
            });
            observer.observe(target);

        }, 300);

        return () => {
            logger.debug("disconnecting observer");
            observer?.disconnect();
        };

    }, [sectionId]);


    return (
        <section className="scroll-reset" id={ `scroll-reset-${sectionId}` } key={ `scroll-reset-${sectionId}` }>
            {
                sectionId &&
                props.children
            }
        </section>
    );
}

