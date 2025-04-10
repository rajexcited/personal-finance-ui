import { FunctionComponent } from "react";

interface AnchorProps extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
}

export const Anchor: FunctionComponent<AnchorProps> = (props) => {
    // eslint-disable-next-line no-script-url
    const href = props.href ? props.href : "javascript:;";
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a { ...props } href={ href } ></a>;
};