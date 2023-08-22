const existingNotesList = document.getElementById('existing-notes');
const noteTitleInput = document.getElementById('note-title');
const noteTextInput = document.getElementById('note-text');
const saveNoteButton = document.getElementById('save-note');
const newNoteButton = document.getElementById('new-note');

let selectedNoteId = null;

function fetchAndDisplayNotes() {
    fetch('/api/notes')
        .then(response => response.json())
        .then(notes => {
            existingNotesList.innerHTML = '';
            notes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.textContent = note.title;
                listItem.dataset.noteId = note.id;
                listItem.addEventListener('click', () => selectNote(note));
                existingNotesList.appendChild(listItem);
            });

            selectedNoteId = null;
            noteTitleInput.value = '';
            noteTextInput.value = '';
        })
        .catch(error => {
            console.error('Error fetching existing notes:', error);
        });
}

fetchAndDisplayNotes();

function selectNote(note) {
    selectedNoteId = note.id;
    noteTitleInput.value = note.title;
    noteTextInput.value = note.text;
}

saveNoteButton.addEventListener('click', () => {
    const newNote = {
        title: noteTitleInput.value,
        text: noteTextInput.value,
        id: selectedNoteId
    };

    const requestOptions = {
        method: selectedNoteId ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
    };

    fetch('/api/notes', requestOptions)
        .then(response => response.json())
        .then(savedNote => {
            fetchAndDisplayNotes();
        })
        .catch(error => {
            console.error('Error saving/updating note:', error);
        });
});

newNoteButton.addEventListener('click', () => {
    selectedNoteId = null;
    noteTitleInput.value = '';
    noteTextInput.value = '';
});
