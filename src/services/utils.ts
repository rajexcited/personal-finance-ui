import axios from "axios";

export const handleRestErrors = (e: Error) => {
  if (axios.isAxiosError(e)) {
    console.error("rest call has errors: ", e);
    if (e.response?.status === 400) {
      // validation error
      const msg = e.response.data.validation_error.body_params
        .map((prm: any) => prm.loc.join() + " - " + prm.msg)
        .join("\n\n");
      throw Error(msg);
    } else if (e.response?.status === 403 && e.response.data.length < 60) {
      const msg = e.response.data;
      throw Error(msg);
    } else {
      throw Error("Unknown server error: " + (e.response?.data || e.cause));
    }
  }
};
