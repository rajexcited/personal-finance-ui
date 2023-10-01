import { FunctionComponent } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface NavbarItemProp {
    id: string;
    link: string;
    icon: IconProp | null;
    label: string;
    isProtected: boolean;
}

const NavBarItem: FunctionComponent<NavbarItemProp> = ({ icon, label, link, id }) => {
    let itemLabelChild: JSX.Element;
    if (icon) {
        itemLabelChild = (
            <span className="icon-text" key={ label }>
                <span className="icon">
                    <FontAwesomeIcon icon={ icon } />
                </span>
                <span> { label } </span>
            </span>
        );
    } else {
        itemLabelChild = <span key={ label }> { label } </span>;
    }

    return <Link className="navbar-item" to={ link }>
        { itemLabelChild }
    </Link>;
};

export default NavBarItem;