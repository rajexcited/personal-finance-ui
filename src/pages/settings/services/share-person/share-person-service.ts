import { ConfigResource, ConfigTypeService, ConfigTypeStatus, ConfigTypeBelongsTo, LoggerBase, getLogger } from "../../../../shared";
import { SharePersonResource, UpdateSharePersonStatusResource } from "./field-type";

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.SharePerson);
const rootLogger = getLogger("settings.service.sharePerson", null, null, "DISABLED");

const convertConfigResourceToSharePerson = (cfg: ConfigResource, _logger: LoggerBase) => {
  const logger = getLogger("convertConfigResourceToSharePerson", _logger);
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
    phone: list[3] || undefined
  };

  return sharePerson;
};

const convertSharePersonToConfigResource = (sharePerson: SharePersonResource, _logger: LoggerBase) => {
  const logger = getLogger("convertSharePersonToConfigResource", _logger);
  logger.debug("sharePerson.id =", sharePerson.id, "email =", sharePerson.emailId);

  const list: string[] = [sharePerson.firstName, sharePerson.lastName, sharePerson.nickName || "", sharePerson.phone || ""];

  const cfg: ConfigResource = {
    id: sharePerson.id,
    description: sharePerson.description,
    auditDetails: sharePerson.auditDetails,
    belongsTo: ConfigTypeBelongsTo.SharePerson,
    name: sharePerson.emailId,
    status: sharePerson.status,
    tags: [],
    value: JSON.stringify(list)
  };

  return cfg;
};

/**
 * retrives undeleted account types
 * @returns list of account type
 */
export const getSharePersonList = async (status?: ConfigTypeStatus) => {
  const logger = getLogger("getSharePersonList", rootLogger);
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const sharePersonCfgList = await configTypeService.getConfigTypeList(paramStatuses);
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
  const sharePersonCfg = await configTypeService.getConfigType(sharePersonId);
  return convertConfigResourceToSharePerson(sharePersonCfg, logger);
};
