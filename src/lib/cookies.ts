import Cookies from "js-cookie";

export default Cookies.withAttributes({
  path: "/",
  secure: true,
  sameSite: "None",
  partitioned: true,
});