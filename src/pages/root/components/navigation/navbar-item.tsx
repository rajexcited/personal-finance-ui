import { FunctionComponent } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface NavbarItemProp {
  id: string;
  link: string;
  icon?: IconProp | null;
  label: string;
  isProtected: boolean;
  isSelected: boolean;
  class?: string;
}

const NavBarItem: FunctionComponent<NavbarItemProp> = (props: NavbarItemProp) => {
  let itemLabelChild: React.JSX.Element;
  if (props.icon) {
    itemLabelChild = (
      <span className="icon-text" key={props.label}>
        <span className="icon">
          <FontAwesomeIcon icon={props.icon} />
        </span>
        <span> {props.label} </span>
      </span>
    );
  } else {
    itemLabelChild = <span key={props.label}> {props.label} </span>;
  }

  return (
    <Link className={`navbar-item ${props.class || ""} ${props.isSelected ? "is-active" : ""}`} to={props.link} id={props.id}>
      {itemLabelChild}
    </Link>
  );
};

export default NavBarItem;
