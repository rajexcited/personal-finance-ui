import { ConfigTypeService, ConfigResource, ConfigTypeStatus, ConfigTypeBelongsTo, UpdateConfigStatusResource } from "../../../services";

const ExpenseCategoryServiceImpl = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.ExpenseCategory);

  /**
   * retrives undeleted categories
   * @returns list of category
   */
  const getCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.Enable, ConfigTypeStatus.Disable]);
    return categories;
  };

  /**
   * retrieves enabled / active categories
   * @returns
   */
  const getActiveCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.Enable]);
    return categories;
  };

  /**
   * retrieves deleted / archived categories
   * @returns
   */
  const getDeletedCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.Deleted]);
    return categories;
  };

  /**
   * adds or updates the category
   * @param category
   */
  const addUpdateCategory = async (category: ConfigResource) => {
    await configTypeService.addUpdateConfigType(category);
  };

  /**
   * deletes or archives a category
   * @param category
   */
  const deleteCategory = async (categoryId: string) => {
    await configTypeService.deleteConfigType(categoryId);
  };

  const updateCategoryStatus = async (categoryStatusData: UpdateConfigStatusResource) => {
    await configTypeService.updateConfigTypeStatus(categoryStatusData);
  };

  return {
    getCategories,
    getActiveCategories,
    getDeletedCategories,
    addUpdateCategory,
    deleteCategory,
    updateCategoryStatus,
  };
};

export default ExpenseCategoryServiceImpl;
