const saveUser = (data) => {
  localStorage.setItem(
    "userInfo",
    JSON.stringify(data)
  );
};


const getUser = () => {
  return JSON.parse(
    localStorage.getItem("userInfo")
  );
};


const logout = () => {
  localStorage.removeItem("userInfo");

  window.location.href =
    "../pages/login.html";
};