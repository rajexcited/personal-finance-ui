import { FunctionComponent } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface NavbarItemProp {
    id: string;
    link: string;
    icon: IconProp | null;
    label: string;
    isProtected: boolean;
    isSelected: boolean;
}

const NavBarItem: FunctionComponent<NavbarItemProp> = ({ icon, label, link, id, isSelected }) => {
    let itemLabelChild: React.JSX.Element;
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

    return <Link className={ `navbar-item ${isSelected ? "is-active" : ""}` } to={ link } id={ id }>
        { itemLabelChild }
    </Link>;
};

export default NavBarItem;