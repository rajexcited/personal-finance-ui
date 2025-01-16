import { TagObject } from "../../../components";
import { SharePersonResource } from "../../settings/services";

export const createSharePersonTagSourceList = (sharePersons: SharePersonResource[]) => {
  return sharePersons.map((sp) => {
    const itm: TagObject = {
      id: sp.id || "sharepersonIdNeverUsed",
      displayText: sp.nickName || `${sp.firstName} ${sp.lastName}`,
      searchText: [sp.nickName || "", sp.firstName, sp.lastName, sp.emailId].join(";")
    };
    return itm;
  });
};

export const createSharePersonTagSourceMap = (sharePersons: SharePersonResource[]) => {
  return sharePersons.reduce((spmap: Record<string, TagObject>, sp) => {
    const itm: TagObject = {
      id: sp.id || "sharepersonIdNeverUsed",
      displayText: sp.nickName || `${sp.firstName} ${sp.lastName}`,
      searchText: [sp.nickName || "", sp.firstName, sp.lastName, sp.emailId].join(";")
    };
    spmap[sp.id] = itm;
    return spmap;
  }, {});
};

export const filterSharePersons = (sharePersonTagSources: TagObject[], selectedPersonIds?: string[]) => {
  if (selectedPersonIds && selectedPersonIds.length > 0) {
    const mySelectedSharePersons = sharePersonTagSources.filter((sspt) => selectedPersonIds.includes(sspt.id));
    return mySelectedSharePersons;
  }
  return [];
};
