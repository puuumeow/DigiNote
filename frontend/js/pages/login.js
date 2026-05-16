const loginForm =
  document.getElementById(
    "loginForm"
  );

loginForm?.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const email =
      document.getElementById(
        "email"
      ).value;

    const password =
      document.getElementById(
        "password"
      ).value;

    const bannedMessage =
      document.getElementById(
        "bannedMessage"
      );

    if(bannedMessage){
      bannedMessage.style.display =
        "none";
    }

    try{

      const response =
        await fetch(
          `${BASE_URL}/auth/login`,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json",
            },

            body:JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if(!response.ok){

        if(response.status === 403 && bannedMessage){
          bannedMessage.textContent =
            data.message ||
            "User banned. Your account has been banned by admin.";

          bannedMessage.style.display =
            "block";
        }

        return showToast(
          data.message,
          "error"
        );
      }

      saveUser(data);

      showToast(
        "Login successful"
      );

      setTimeout(() => {

        window.location.href =
          "./dashboard.html";

      }, 1000);

    }
    catch(error){

      showToast(
        "Something went wrong",
        "error"
      );
    }
  }
);