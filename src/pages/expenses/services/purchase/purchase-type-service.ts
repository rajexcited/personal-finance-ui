import pDebounce from "p-debounce";
import {
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  UpdateConfigStatusResource,
  UpdateConfigDetailsResource,
  DeleteConfigDetailsResource,
  TagsService,
  TagBelongsTo,
} from "../../../../shared";
import ms from "ms";

export const PurchaseTypeService = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.PurchaseType);
  const tagService = TagsService();

  /**
   *
   * @returns
   */
  const initializeTags = pDebounce(async () => {
    const tagCount = await tagService.getCount(TagBelongsTo.PurchaseTypeConfig);
    if (tagCount > 0) {
      return;
    }
    const response = await configTypeService.getConfigTags();
    await tagService.updateTags(TagBelongsTo.PurchaseTypeConfig, response);
  }, ms("2 sec"));

  return {
    /**
     * retrives undeleted categories
     */
    getTypes: async (status?: ConfigTypeStatus) => {
      const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
      const promise = configTypeService.getConfigTypeList(paramStatuses);
      await Promise.all([promise, initializeTags()]);
      const typeList = await promise;
      return typeList;
    },

    /**
     * retrives type item
     */
    getType: async (typeId: string) => {
      const promise = configTypeService.getConfigType(typeId);
      await Promise.all([promise, initializeTags()]);
      const type = await promise;
      return type;
    },

    /**
     * adds or updates the type
     */
    addUpdateType: async (type: UpdateConfigDetailsResource) => {
      await configTypeService.addUpdateConfigType(type);
    },

    /**
     * deletes or archives a type
     */
    deleteType: async (type: DeleteConfigDetailsResource) => {
      await configTypeService.deleteConfigType(type.id);
    },

    /**
     * updates status of type
     */
    updateTypeStatus: async (typeStatusData: UpdateConfigStatusResource) => {
      await configTypeService.updateConfigTypeStatus(typeStatusData);
    },

    /**
     * Retrieves all tags associated to purchase types
     */
    getTags: async () => {
      const tagList = await tagService.getTags(TagBelongsTo.PurchaseTypeConfig);
      return tagList;
    },
  };
};
