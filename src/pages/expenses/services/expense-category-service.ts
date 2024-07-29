import {
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  UpdateConfigStatusResource,
  UpdateConfigDetailsResource,
  DeleteConfigDetailsResource,
  TagsService,
  TagBelongsTo,
} from "../../../services";

export const ExpenseCategoryService = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.ExpenseCategory);
  const tagService = TagsService();

  /**
   * retrives undeleted categories
   * @returns list of category
   */
  const getCategories = async (status?: ConfigTypeStatus) => {
    const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
    const categoryListPromise = configTypeService.getConfigTypeList(paramStatuses);
    await Promise.all([categoryListPromise, initializeCategoryTags()]);
    return await categoryListPromise;
  };

  /**
   * retrives category item
   * @returns category item
   */
  const getCategory = async (categoryId: string) => {
    const categoryPromise = configTypeService.getConfigType(categoryId);
    await Promise.all([categoryPromise, initializeCategoryTags()]);
    return await categoryPromise;
  };

  /**
   * adds or updates the category
   * @param category
   */
  const addUpdateCategory = async (category: UpdateConfigDetailsResource) => {
    await configTypeService.addUpdateConfigType(category);
  };

  /**
   * deletes or archives a category
   * @param category
   */
  const deleteCategory = async (category: DeleteConfigDetailsResource) => {
    await configTypeService.deleteConfigType(category.id);
  };

  const updateCategoryStatus = async (categoryStatusData: UpdateConfigStatusResource) => {
    await configTypeService.updateConfigTypeStatus(categoryStatusData);
  };

  const initializeCategoryTags = async () => {
    const tagCount = await tagService.getCount(TagBelongsTo.ExpenseCategoryConfig);
    if (tagCount > 0) {
      return;
    }

    const response = await configTypeService.getConfigTags();
    await tagService.updateTags(TagBelongsTo.ExpenseCategoryConfig, response);
  };

  const getCategoryTags = async () => {
    const tagList = await tagService.getTags(TagBelongsTo.ExpenseCategoryConfig);
    return tagList;
  };

  return {
    getCategories,
    getCategory,
    addUpdateCategory,
    deleteCategory,
    updateCategoryStatus,
    getCategoryTags,
  };
};
