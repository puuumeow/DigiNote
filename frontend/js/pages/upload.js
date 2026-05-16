const uploadForm = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const categoryInput = document.getElementById("category");
const customCategoryGroup = document.getElementById("customCategoryGroup");
const customCategoryInput = document.getElementById("customCategory");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const universityInput = document.getElementById("university");
const customUniversityInput = document.getElementById("customUniversity");
const addUniversityBtn = document.getElementById("addUniversityBtn");
const facultyInput = document.getElementById("faculty");
const customFacultyInput = document.getElementById("customFaculty");
const addFacultyBtn = document.getElementById("addFacultyBtn");
const departmentInput = document.getElementById("department");
const customDepartmentInput = document.getElementById("customDepartment");
const addDepartmentBtn = document.getElementById("addDepartmentBtn");
const tagsInput = document.getElementById("tags");
const isPaidInput = document.getElementById("isPaid");
const priceGroup = document.getElementById("priceGroup");
const priceInput = document.getElementById("price");
const pdfInput = document.getElementById("pdf");
const pdfFileName = document.getElementById("pdfFileName");

const CUSTOM_CATEGORY_VALUE = "__custom_category__";
const CUSTOM_UNIVERSITY_VALUE = "__custom_university__";
const CUSTOM_FACULTY_VALUE = "__custom_faculty__";
const CUSTOM_DEPARTMENT_VALUE = "__custom_department__";

const user = getUser();

if (!user) {
  window.location.href = "./login.html";
}

const populateUploadOptions = () => {
  getManagedDigiNoteCategories().forEach((item) => {
    const option = document.createElement("option");
    option.value = item.category;
    option.innerText = item.category;
    categoryInput.appendChild(option);
  });

  const customCategoryOption = document.createElement("option");
  customCategoryOption.value = CUSTOM_CATEGORY_VALUE;
  customCategoryOption.innerText = "＋ Add custom category";
  categoryInput.appendChild(customCategoryOption);

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

  universityInput.value = "Bangladesh University of Professionals";
};

const setDepartmentOptions = (departments = []) => {
  departmentInput.innerHTML = '<option value="">Select department</option>';

  sortTextAsc(departments).forEach((department) => {
    const option = document.createElement("option");
    option.value = department;
    option.innerText = department;
    departmentInput.appendChild(option);
  });

  const customDepartmentOption = document.createElement("option");
  customDepartmentOption.value = CUSTOM_DEPARTMENT_VALUE;
  customDepartmentOption.innerText = "＋ Add custom department";
  departmentInput.appendChild(customDepartmentOption);

  customDepartmentInput.style.display = "none";
  customDepartmentInput.required = false;
  customDepartmentInput.value = "";
};

const showCustomCategory = () => {
  customCategoryGroup.style.display = "block";
  customCategoryInput.required = true;

  facultyInput.value = CUSTOM_FACULTY_VALUE;
  customFacultyInput.style.display = "block";
  customFacultyInput.required = true;
  customFacultyInput.placeholder = "Example: Faculty of Environmental Studies";
  tagsInput.value = "";

  setDepartmentOptions();
  departmentInput.value = CUSTOM_DEPARTMENT_VALUE;
  customDepartmentInput.style.display = "block";
  customDepartmentInput.required = true;
};

const hideCustomCategory = () => {
  customCategoryGroup.style.display = "none";
  customCategoryInput.required = false;
  customCategoryInput.value = "";
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

const showCustomDepartment = () => {
  const hasCustomOption = Array.from(departmentInput.options).some(
    (option) => option.value === CUSTOM_DEPARTMENT_VALUE
  );

  if (!hasCustomOption) {
    const customDepartmentOption = document.createElement("option");
    customDepartmentOption.value = CUSTOM_DEPARTMENT_VALUE;
    customDepartmentOption.innerText = "＋ Add custom department";
    departmentInput.appendChild(customDepartmentOption);
  }

  departmentInput.value = CUSTOM_DEPARTMENT_VALUE;
  customDepartmentInput.style.display = "block";
  customDepartmentInput.required = true;
  customDepartmentInput.focus();
};

const hideCustomDepartment = () => {
  customDepartmentInput.style.display = "none";
  customDepartmentInput.required = false;
  customDepartmentInput.value = "";
};

universityInput?.addEventListener("change", () => {
  if (universityInput.value === CUSTOM_UNIVERSITY_VALUE) {
    showCustomUniversity();
  } else {
    hideCustomUniversity();
  }
});

addUniversityBtn?.addEventListener("click", () => {
  showCustomUniversity();
});

facultyInput?.addEventListener("change", () => {
  if (facultyInput.value === CUSTOM_FACULTY_VALUE) {
    showCustomFaculty();
  } else {
    hideCustomFaculty();
  }
});

addFacultyBtn?.addEventListener("click", () => {
  showCustomFaculty();
});

categoryInput?.addEventListener("change", () => {
  if (categoryInput.value === CUSTOM_CATEGORY_VALUE) {
    showCustomCategory();
    customCategoryInput.focus();
    return;
  }

  hideCustomCategory();

  const selectedCategory = getManagedDigiNoteCategories().find(
    (item) => item.category === categoryInput.value
  );

  if (!selectedCategory) {
    facultyInput.value = "";
    customFacultyInput.style.display = "none";
    customFacultyInput.required = false;
    customFacultyInput.value = "";
    tagsInput.value = "";
    setDepartmentOptions();
    return;
  }

  facultyInput.value = selectedCategory.faculty;
  customFacultyInput.style.display = "none";
  customFacultyInput.required = false;
  customFacultyInput.value = "";
  tagsInput.value = selectedCategory.tags;
  setDepartmentOptions(selectedCategory.departments);
});

addCategoryBtn?.addEventListener("click", () => {
  categoryInput.value = CUSTOM_CATEGORY_VALUE;
  showCustomCategory();
  customCategoryInput.focus();
});

departmentInput?.addEventListener("change", () => {
  if (departmentInput.value === CUSTOM_DEPARTMENT_VALUE) {
    showCustomDepartment();
  } else {
    hideCustomDepartment();
  }
});

addDepartmentBtn?.addEventListener("click", () => {
  showCustomDepartment();
});

isPaidInput?.addEventListener("change", () => {
  const isPaid = isPaidInput.value === "true";

  priceGroup.style.display = isPaid ? "block" : "none";
  priceInput.required = isPaid;

  if (!isPaid) {
    priceInput.value = "";
  }
});

pdfInput?.addEventListener("change", () => {
  const file = pdfInput.files[0];
  pdfFileName.innerText = file ? file.name : "Click to choose a PDF file";
});

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

const getFinalCategory = () => {
  if (categoryInput.value === CUSTOM_CATEGORY_VALUE) {
    return customCategoryInput.value.trim();
  }

  return categoryInput.value.trim();
};

const getFinalDepartment = () => {
  if (departmentInput.value === CUSTOM_DEPARTMENT_VALUE) {
    return customDepartmentInput.value.trim();
  }

  return departmentInput.value.trim();
};

uploadForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const selectedFile = pdfInput.files[0];
  const finalUniversity = getFinalUniversity();
  const finalFaculty = getFinalFaculty();
  const finalCategory = getFinalCategory();
  const finalDepartment = getFinalDepartment();

  if (!finalUniversity) {
    return showToast("Please choose or add a university", "error");
  }

  if (!finalCategory) {
    return showToast("Please choose or add a category", "error");
  }

  if (!finalFaculty) {
    return showToast("Please choose or add a faculty", "error");
  }

  if (!finalDepartment) {
    return showToast("Please choose or add a department", "error");
  }

  if (!selectedFile) {
    return showToast("Please choose a PDF file", "error");
  }

  const fileName = selectedFile.name.toLowerCase();

  if (!fileName.endsWith(".pdf")) {
    return showToast("Only PDF files are allowed", "error");
  }

  const isPaid = isPaidInput.value === "true";

  if (isPaid && Number(priceInput.value) <= 0) {
    return showToast("Enter a valid price for paid notes", "error");
  }

  const formData = new FormData();

  formData.append("title", document.getElementById("title").value.trim());
  formData.append("description", document.getElementById("description").value.trim());
  formData.append("category", finalCategory);
  formData.append("university", finalUniversity);
  formData.append("faculty", finalFaculty);
  formData.append("department", finalDepartment);
  formData.append("tags", tagsInput.value.trim());
  formData.append("isPaid", isPaidInput.value);
  formData.append("price", isPaid ? priceInput.value : 0);
  formData.append("pdf", selectedFile);

  try {
    uploadBtn.disabled = true;
    uploadBtn.innerText = "Uploading...";

    const response = await fetch(`${BASE_URL}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      data = {
        message: responseText || "Upload failed",
      };
    }

    if (!response.ok) {
      return showToast(data.message || "Upload failed", "error");
    }

    showToast("Note uploaded successfully");
    uploadForm.reset();
    pdfFileName.innerText = "Click to choose a PDF file";
    priceGroup.style.display = "none";
    universityInput.value = "Bangladesh University of Professionals";
    hideCustomUniversity();
    facultyInput.value = "";
    hideCustomFaculty();
    hideCustomCategory();
    setDepartmentOptions();
  } catch (error) {
    showToast(error.message || "Upload failed. Please check your backend server.", "error");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerText = "Upload Note";
  }
});

populateUploadOptions();
setDepartmentOptions();
