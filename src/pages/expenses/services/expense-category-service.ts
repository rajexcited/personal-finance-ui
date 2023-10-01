import { ConfigTypeService, ConfigType, ConfigTypeStatus } from "../../../services";

interface ExpenseCategoryService {
  getCategories(): Promise<ConfigType[]>;
  getActiveCategories(): Promise<ConfigType[]>;
  getDeletedCategories(): Promise<ConfigType[]>;
  addUpdateCategory(category: ConfigType): Promise<void>;
  removeCategory(category: ConfigType): Promise<void>;
  disableCategory(category: ConfigType): Promise<void>;
  enableCategory(category: ConfigType): Promise<void>;
  destroy(): void;
}

const ExpenseCategoryServiceImpl = (): ExpenseCategoryService => {
  const configTypeService = ConfigTypeService("expense-category");

  /**
   * retrives undeleted categories
   * @returns list of category
   */
  const getCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.enable, ConfigTypeStatus.disable]);
    return categories;
  };

  /**
   * retrieves enabled / active categories
   * @returns
   */
  const getActiveCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.enable]);
    return categories;
  };

  /**
   * retrieves deleted / archived categories
   * @returns
   */
  const getDeletedCategories = async () => {
    const categories = await configTypeService.getConfigTypes([ConfigTypeStatus.deleted]);
    return categories;
  };

  /**
   * adds or updates the category
   * @param category
   */
  const addUpdateCategory = async (category: ConfigType) => {
    await configTypeService.addUpdateConfigType(category);
  };

  /**
   * deletes or archives a category
   * @param category
   */
  const removeCategory = async (category: ConfigType) => {
    await configTypeService.removeConfigType(category);
  };

  const enableCategory = async (category: ConfigType) => {
    const ctgry = {
      ...category,
      status: ConfigTypeStatus.enable,
    };
    await configTypeService.addUpdateConfigType(ctgry);
  };

  const disableCategory = async (category: ConfigType) => {
    const ctgry = {
      ...category,
      status: ConfigTypeStatus.disable,
    };
    await configTypeService.addUpdateConfigType(ctgry);
  };

  return {
    getCategories,
    getActiveCategories,
    getDeletedCategories,
    addUpdateCategory,
    removeCategory,
    enableCategory,
    disableCategory,
    destroy: configTypeService.destroy.bind(null),
  };
};

export default ExpenseCategoryServiceImpl;
