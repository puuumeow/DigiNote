const registerForm = document.getElementById("registerForm");
const universityInput = document.getElementById("university");
const facultyInput = document.getElementById("faculty");
const departmentInput = document.getElementById("department");
const customUniversityInput = document.getElementById("customUniversity");
const customFacultyInput = document.getElementById("customFaculty");
const addUniversityBtn = document.getElementById("addUniversityBtn");
const addFacultyBtn = document.getElementById("addFacultyBtn");
const departmentSuggestions = document.getElementById("departmentSuggestions");

const CUSTOM_UNIVERSITY_VALUE = "__custom_university__";
const CUSTOM_FACULTY_VALUE = "__custom_faculty__";

const populateRegisterSuggestions = () => {
  sortTextAsc(DIGINOTE_UNIVERSITIES).forEach((university) => {
    const option = document.createElement("option");
    option.value = university;
    option.innerText = university;
    universityInput.appendChild(option);
  });

  const customUniversityOption = document.createElement("option");
  customUniversityOption.value = CUSTOM_UNIVERSITY_VALUE;
  customUniversityOption.innerText = "＋ Add custom university";
  universityInput.appendChild(customUniversityOption);

  sortTextAsc(DIGINOTE_FACULTIES).forEach((faculty) => {
    const option = document.createElement("option");
    option.value = faculty;
    option.innerText = faculty;
    facultyInput.appendChild(option);
  });

  const customFacultyOption = document.createElement("option");
  customFacultyOption.value = CUSTOM_FACULTY_VALUE;
  customFacultyOption.innerText = "＋ Add custom faculty";
  facultyInput.appendChild(customFacultyOption);

  getAllManagedDepartments().forEach((department) => {
    const option = document.createElement("option");
    option.value = department;
    departmentSuggestions.appendChild(option);
  });

  universityInput.value = "Bangladesh University of Professionals";
};

const showCustomUniversity = () => {
  universityInput.value = CUSTOM_UNIVERSITY_VALUE;
  customUniversityInput.style.display = "block";
  customUniversityInput.required = true;
  customUniversityInput.focus();
};

const hideCustomUniversity = () => {
  customUniversityInput.style.display = "none";
  customUniversityInput.required = false;
  customUniversityInput.value = "";
};

const showCustomFaculty = () => {
  facultyInput.value = CUSTOM_FACULTY_VALUE;
  customFacultyInput.style.display = "block";
  customFacultyInput.required = true;
  customFacultyInput.focus();
};

const hideCustomFaculty = () => {
  customFacultyInput.style.display = "none";
  customFacultyInput.required = false;
  customFacultyInput.value = "";
};

universityInput?.addEventListener("change", () => {
  if (universityInput.value === CUSTOM_UNIVERSITY_VALUE) {
    showCustomUniversity();
  } else {
    hideCustomUniversity();
  }
});

facultyInput?.addEventListener("change", () => {
  if (facultyInput.value === CUSTOM_FACULTY_VALUE) {
    showCustomFaculty();
  } else {
    hideCustomFaculty();
  }
});

addUniversityBtn?.addEventListener("click", showCustomUniversity);
addFacultyBtn?.addEventListener("click", showCustomFaculty);

const getFinalUniversity = () => {
  if (universityInput.value === CUSTOM_UNIVERSITY_VALUE) {
    return customUniversityInput.value.trim();
  }

  return universityInput.value.trim();
};

const getFinalFaculty = () => {
  if (facultyInput.value === CUSTOM_FACULTY_VALUE) {
    return customFacultyInput.value.trim();
  }

  return facultyInput.value.trim();
};

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const university = getFinalUniversity();
  const faculty = getFinalFaculty();
  const department = departmentInput.value.trim();

  if (!fullName || !email || !password || !university || !faculty || !department) {
    return showToast("Please fill in every required field", "error");
  }

  if (password.length < 6) {
    return showToast("Password must be at least 6 characters", "error");
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        password,
        university,
        faculty,
        department,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showToast(data.message, "error");
    }

    saveUser(data);
    showToast("Registration successful");

    setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 1000);
  } catch (error) {
    showToast("Something went wrong", "error");
  }
});

populateRegisterSuggestions();
