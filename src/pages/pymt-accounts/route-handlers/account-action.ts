import { ActionFunctionArgs, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root/navigation";
import { PymtAccountService } from "../services";

const pymtAccountService = PymtAccountService();

export const pymtAccountAddUpdateActionHandler = async ({ request }: ActionFunctionArgs) => {
  console.log("pymt add action");
  const formdata = await request.formData();
  const data: any = {};

  data.accountId = formdata.get("accountId");
  data.shortName = formdata.get("shortName");
  data.accountName = formdata.get("accountName");
  data.accountNumber = formdata.get("accountNumber");
  if (formdata.get("typeId")) data.typeId = formdata.get("typeId");
  if (formdata.get("typeName")) data.typeName = formdata.get("typeName");
  data.tags = formdata.get("tags");
  data.institutionName = formdata.get("institutionName");
  data.description = formdata.get("description");
  if (formdata.get("icon")) data.icon = formdata.get("icon");

  try {
    await pymtAccountService.addUpdatePymtAccount(data);
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }

  return redirect(PAGE_URL.pymtAccountsRoot.fullUrl);
};
