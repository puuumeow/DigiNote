const myNotesContainer =
  document.getElementById(
    "myNotesContainer"
  );

const currentUser = getUser();


// PROTECT PAGE
if(!currentUser){

  window.location.href =
    "./login.html";
}


// LOAD MY NOTES
const loadMyNotes = async () => {

  try{

    const response =
      await fetch(
        `${BASE_URL}/notes/my-notes`,
        {
          headers:{
            Authorization:
              `Bearer ${currentUser.token}`,
          },
        }
      );

    const notes =
      await response.json();

    myNotesContainer.innerHTML = "";

    if(notes.length === 0){

      return myNotesContainer.innerHTML =
        `
          <div class="empty-state">
            <h2>No uploaded notes</h2>
          </div>
        `;
    }

    notes.forEach((note) => {

      myNotesContainer.innerHTML += `
      
        <div
          class="
            glass-card
            note-card
          "
        >

          <h2 class="note-title">
            ${note.title}
          </h2>

          <p
            class="
              note-description
              text-secondary
            "
          >
            ${note.description}
          </p>

<div class="note-actions">

  <a
    href="
      http://localhost:5000/${note.pdfFile}
    "
    target="_blank"
    class="
      btn
      btn-outline
    "
  >
    Preview
  </a>

  <button
    onclick="
      downloadNote(
        '${note._id}'
      )
    "
    class="
      btn
      btn-primary
    "
  >
    Download
  </button>

</div>

        </div>
      `;
    });

  }
  catch(error){

    showToast(
      "Failed to load notes",
      "error"
    );
  }
};


// DELETE NOTE
const deleteNote = async (
  noteId
) => {

  const confirmDelete =
    confirm(
      "Delete this note?"
    );

  if(!confirmDelete) return;

  try{

    const response =
      await fetch(
        `${BASE_URL}/notes/${noteId}`,
        {
          method:"DELETE",

          headers:{
            Authorization:
              `Bearer ${currentUser.token}`,
          },
        }
      );

    const data =
      await response.json();

    if(!response.ok){

      return showToast(
        data.message,
        "error"
      );
    }

    showToast(
      "Note deleted"
    );

    loadMyNotes();

  }
  catch(error){

    showToast(
      "Delete failed",
      "error"
    );
  }
};


// INITIAL LOAD
loadMyNotes();