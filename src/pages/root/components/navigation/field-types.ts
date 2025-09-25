import { IconProp } from "@fortawesome/fontawesome-svg-core";

export interface SubNavItem {
  id: string;
  title: string;
  url: string;
  icon?: IconProp;
}
