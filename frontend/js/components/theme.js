const themeToggle =
  document.getElementById(
    "themeToggle"
  );


// LOAD SAVED THEME
const savedTheme =
  localStorage.getItem(
    "theme"
  );

if(savedTheme === "light"){

  document.body.classList.add(
    "light-mode"
  );

  if(themeToggle){

    themeToggle.innerText =
      "☀️";
  }

} else {

  if(themeToggle){

    themeToggle.innerText =
      "🌙";
  }
}


// TOGGLE THEME
themeToggle?.addEventListener(
  "click",
  () => {

    document.body.classList.toggle(
      "light-mode"
    );

    // LIGHT MODE
    if(
      document.body.classList.contains(
        "light-mode"
      )
    ){

      localStorage.setItem(
        "theme",
        "light"
      );

      themeToggle.innerText =
        "☀️";

    }

    // DARK MODE
    else {

      localStorage.setItem(
        "theme",
        "dark"
      );

      themeToggle.innerText =
        "🌙";
    }
  }
);