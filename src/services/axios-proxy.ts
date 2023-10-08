import axios from "axios";

const axiosProxy = axios.create({
  baseURL: "http://localhost:5000/my-finance/rest",
});

export default axiosProxy;
