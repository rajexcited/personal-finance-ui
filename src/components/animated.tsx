import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import "./animated.css";
import "animate.css/animate.min.css";
import { getLogger, sleep } from "../shared";


export interface AnimatedProps {
    children: React.JSX.Element | React.JSX.Element[] | React.ReactNode;
    animatedIn?: string;
    animatedOut?: string;
    isPlayIn: boolean;
    animateOnMount: boolean;
    resetOnAnimationEnd?: boolean;
    isVisibleAfterAnimateOut?: boolean;
    scrollBeforePlayIn?: boolean;
}

const isElementInViewport = (animateElement: HTMLDivElement) => {
    const elementRect = animateElement.getBoundingClientRect();
    const screenHeight = (window.innerHeight || window.document.documentElement.clientHeight);
    const screenWidth = (window.innerWidth || window.document.documentElement.clientWidth);

    return elementRect.top >= 0
        && elementRect.left >= 0
        && (elementRect.bottom <= screenHeight || elementRect.height > screenHeight)
        && (elementRect.right <= screenWidth || elementRect.width > screenWidth);
};
const fcLogger = getLogger("FC.Animated", null, null, "DISABLED");

/**
 * doc link - https://animate.style/#utilities
 */
const Animated: FunctionComponent<AnimatedProps> = (props) => {
    const [visible, setVisible] = useState(props.animateOnMount);
    const [isHeightTransitionEnded, setHeightTransitionEnded] = useState(false);
    const [isPlayIn, setPlayIn] = useState(props.isPlayIn);
    const animatedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const animationEndHandler = (event: AnimationEvent) => {
            event.preventDefault();
            timeoutId = setTimeout(() => {
                setVisible(false);
            }, 100);

            document.documentElement.classList.remove('isPlaying');
        };

        const animationStartHandler = (event: AnimationEvent) => {
            event.preventDefault();
            clearTimeout(timeoutId);
            document.documentElement.classList.add('isPlaying');
        };

        const transitionEndHandler = (event: TransitionEvent) => {
            event.preventDefault();
            setTimeout(() => {
                setHeightTransitionEnded(true);
            }, 100);
        };

        animatedRef.current?.addEventListener("animationend", animationEndHandler);
        animatedRef.current?.addEventListener("animationstart", animationStartHandler);
        animatedRef.current?.addEventListener("transitionend", transitionEndHandler);

        return () => {
            animatedRef.current?.removeEventListener("animationend", animationEndHandler);
            animatedRef.current?.removeEventListener("animationstart", animationStartHandler);
            animatedRef.current?.removeEventListener("transitionend", transitionEndHandler);
        };
    }, [animatedRef.current]);

    useEffect(() => {
        const logger = getLogger("useEffect.dep[props.isPlayIn, props.animatedIn, props.animatedOut, animatedRef]", fcLogger);

        let sleepPromise = Promise.resolve();
        if (props.isPlayIn !== isPlayIn) {
            if (props.animatedIn && props.isPlayIn && animatedRef.current) {
                if (!isElementInViewport(animatedRef.current)) {
                    logger.debug("since child maynot be visible before animation, scrolling a bit higher");
                    window.scrollBy(0, animatedRef.current.getBoundingClientRect().top - 30);
                    sleepPromise = sleep("200ms");
                }
            }
            if ((props.animatedIn && props.isPlayIn) || (props.animatedOut && !props.isPlayIn)) {
                sleepPromise.then(() => {
                    setPlayIn(props.isPlayIn);
                    setVisible(true);
                    setHeightTransitionEnded(false);
                });
            }
        }
    }, [props.isPlayIn, props.animatedIn, props.animatedOut, animatedRef]);

    let animateClassname = visible || !props.resetOnAnimationEnd ? `animate__animated animate__${isPlayIn ? props.animatedIn : props.animatedOut}` : "";
    if (props.isVisibleAfterAnimateOut === false) {
        const heightTransitionClassname = isPlayIn ? "transition__height_auto" : "transition__height_0";
        animateClassname = animateClassname + " " + heightTransitionClassname;
    }

    return <div className={ animateClassname } ref={ animatedRef }>
        { (visible || props.isVisibleAfterAnimateOut !== false || isPlayIn || !isHeightTransitionEnded) &&
            props.children
        }
    </div>;
};

export default Animated;
