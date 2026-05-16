const bookmarksContainer =
  document.getElementById(
    "bookmarksContainer"
  );

const user = getUser();


// PROTECT
if(!user){

  window.location.href =
    "./login.html";
}


// LOAD BOOKMARKS
const loadBookmarks =
  async () => {

    try{

      bookmarksContainer.innerHTML =
        "<p>Loading bookmarks...</p>";

      const response =
        await fetch(
          `${BASE_URL}/notes/bookmarks`,
          {
            headers:{
              Authorization:
                `Bearer ${user.token}`,
            },
          }
        );

      const data =
        await response.json();

      bookmarksContainer.innerHTML =
        "";

      if(data.length === 0){

        return bookmarksContainer.innerHTML =
          `
            <div class="empty-state">

              <h2>
                No bookmarks yet
              </h2>

              <p class="text-secondary">
                Save notes to view them here
              </p>

            </div>
          `;
      }


      data.forEach((note) => {

        bookmarksContainer.innerHTML += `
        
          <div
            class="
              glass-card
              note-card
            "
          >

            <div class="note-top">

              <span
                class="
                  note-category
                "
              >
                ${note.category}
              </span>

              <span
                class="text-secondary"
              >
                👍 ${note.upvotes}
              </span>

            </div>


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


            <div class="note-footer">

              <div>

                <strong>
                  ${note.user.fullName}
                </strong>

                <p
                  class="
                    text-secondary
                  "
                >
                  ${note.university}
                </p>

              </div>

              <span>
                ⬇ ${note.downloads}
              </span>

            </div>


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

      bookmarksContainer.innerHTML =
        "<p>Failed to load bookmarks</p>";
    }
  };


// DOWNLOAD
const downloadNote = (
  noteId
) => {

  window.open(
    `${BASE_URL}/notes/download/${noteId}`,
    "_blank"
  );
};


loadBookmarks();