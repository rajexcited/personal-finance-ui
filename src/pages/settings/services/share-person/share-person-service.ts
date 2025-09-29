import pMemoize from "p-memoize";
import {
  ConfigResource,
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  LoggerBase,
  getLogger,
  TagsService,
  TagBelongsTo,
  getCacheOption
} from "../../../../shared";
import { SharePersonResource, UpdateSharePersonStatusResource } from "./field-type";

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.SharePerson);
const rootLogger = getLogger("settings.service.sharePerson", null, null, "DISABLED");
const tagService = TagsService(TagBelongsTo.SharePersonConfig);

const convertConfigResourceToSharePerson = (cfg: ConfigResource, baseLogger: LoggerBase) => {
  const logger = getLogger("convertConfigResourceToSharePerson", baseLogger);
  logger.debug("cfg.id =", cfg.id, "cfg.name =", cfg.name);

  const list = JSON.parse(cfg.value) as string[];
  logger.debug("list.length =", list.length);

  const sharePerson: SharePersonResource = {
    id: cfg.id,
    description: cfg.description,
    auditDetails: cfg.auditDetails,
    status: cfg.status,
    emailId: cfg.name,
    firstName: list[0],
    lastName: list[1],
    nickName: list[2] || undefined,
    phone: list[3] || undefined,
    tags: cfg.tags
  };

  return sharePerson;
};

const convertSharePersonToConfigResource = (sharePerson: SharePersonResource, baseLogger: LoggerBase) => {
  const logger = getLogger("convertSharePersonToConfigResource", baseLogger);
  logger.debug("sharePerson.id =", sharePerson.id, "email =", sharePerson.emailId);

  const list: string[] = [sharePerson.firstName, sharePerson.lastName, sharePerson.nickName || "", sharePerson.phone || ""];

  const cfg: ConfigResource = {
    id: sharePerson.id,
    description: sharePerson.description,
    auditDetails: sharePerson.auditDetails,
    belongsTo: ConfigTypeBelongsTo.SharePerson,
    name: sharePerson.emailId,
    status: sharePerson.status,
    tags: sharePerson.tags,
    value: JSON.stringify(list)
  };

  return cfg;
};

const initializeTags = pMemoize(async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }
  const response = await configTypeService.getConfigTags();
  await tagService.updateTags(response);
}, getCacheOption("2 sec"));

/**
 * retrives undeleted account types
 * @returns list of account type
 */
export const getSharePersonList = async (status?: ConfigTypeStatus) => {
  const logger = getLogger("getSharePersonList", rootLogger);
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const promise = configTypeService.getConfigTypeList(paramStatuses);
  await Promise.all([promise, initializeTags()]);
  const sharePersonCfgList = await promise;
  return sharePersonCfgList.map((cfg) => convertConfigResourceToSharePerson(cfg, logger));
};

export const addUpdateSharePerson = async (sharePerson: SharePersonResource) => {
  const logger = getLogger("addUpdateSharePerson", rootLogger);
  const cfg = convertSharePersonToConfigResource(sharePerson, logger);
  await configTypeService.addUpdateConfigType(cfg);
};

export const deleteSharePerson = async (sharePersonId: string) => {
  await configTypeService.deleteConfigType(sharePersonId);
};

export const updateSharePersonStatus = async (sharePersonStatusData: UpdateSharePersonStatusResource) => {
  await configTypeService.updateConfigTypeStatus(sharePersonStatusData);
};

export const getSharePerson = async (sharePersonId: string) => {
  const logger = getLogger("getSharePerson", rootLogger);
  const promise = configTypeService.getConfigType(sharePersonId);
  await Promise.all([promise, initializeTags()]);
  const sharePersonCfg = await promise;
  return convertConfigResourceToSharePerson(sharePersonCfg, logger);
};

/**
 * Retrieves all tags associated to refund types
 */
export const getTagList = async () => {
  const tagList = await tagService.getTags();
  return tagList;
};
