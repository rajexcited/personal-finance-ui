import { FunctionComponent, useState, useRef, useEffect } from "react";

interface AnimatedProps {
    children: JSX.Element | JSX.Element[] | React.ReactNode;
    animatedIn?: string;
    animatedOut?: string;
    isPlayIn: boolean;
    animateOnMount: boolean;
    resetOnAnimationEnd?: boolean;
    isVisibleAfterAnimateOut?: boolean;
}

const Animated: FunctionComponent<AnimatedProps> = (props) => {
    const [visible, setVisible] = useState(props.animateOnMount);
    const [isPlayIn, setPlayIn] = useState(props.isPlayIn);
    const animatedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const animationEndHandler = (event: AnimationEvent) => {
            event.preventDefault();
            timeoutId = setTimeout(() => {
                setVisible(false);
                console.debug("animation ended,  visible: ", visible);
            }, 100);

            document.documentElement.classList.remove('isPlaying');
        };

        const animationStartHandler = (event: AnimationEvent) => {
            event.preventDefault();
            console.debug("animation start");
            clearTimeout(timeoutId);
            document.documentElement.classList.add('isPlaying');
        };

        animatedRef.current?.addEventListener("animationend", animationEndHandler);
        animatedRef.current?.addEventListener("animationstart", animationStartHandler);

        return () => {
            animatedRef.current?.removeEventListener("animationend", animationEndHandler);
            animatedRef.current?.removeEventListener("animationstart", animationStartHandler);
        };
    }, []);

    useEffect(() => {
        if (props.isPlayIn !== isPlayIn) {
            if ((props.animatedIn && props.isPlayIn) || (props.animatedOut && !props.isPlayIn)) {
                setPlayIn(props.isPlayIn);
                setVisible(true);
            }
        }
    }, [props.isPlayIn]);

    console.debug("visible: ", visible, "isPlayIn: ", isPlayIn, "animate class: ", (visible ? `animate__animated animate__${isPlayIn && props.resetOnAnimationEnd ? props.animatedIn : props.animatedOut}` : ""), new Date());

    return <div className={ visible || !props.resetOnAnimationEnd ? `animate__animated animate__${isPlayIn ? props.animatedIn : props.animatedOut}` : "" } ref={ animatedRef }>
        { (visible || props.isVisibleAfterAnimateOut !== false || isPlayIn) &&
            props.children
        }
    </div>;
};

export default Animated;
