import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { PymtAccountService } from "../services";

const pymtAccountService = PymtAccountService();

export const pymtAccountActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await pymtAccountAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccountDeleteActionHandler(request);
  }
};

const pymtAccountAddUpdateActionHandler = async (request: Request) => {
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

const pymtAccountDeleteActionHandler = async (request: Request) => {
  try {
    const formdata = await request.formData();
    const accountId = formdata.get("accountId") as string;
    await pymtAccountService.removePymtAccount(accountId);
    return "deleted";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};
