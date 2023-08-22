const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = generateUniqueId();

    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const notes = JSON.parse(data);
            notes.push(newNote);

            fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), writeErr => {
                if (writeErr) {
                    console.error('Error writing to db.json:', writeErr);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.json(newNote);
            });
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.put('/api/notes', (req, res) => {
    const updatedNote = req.body;

    fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            const notes = JSON.parse(data);
            const noteIndex = notes.findIndex(note => note.id === updatedNote.id);

            if (noteIndex !== -1) {
                notes[noteIndex] = updatedNote;

                fs.writeFile(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes, null, 2), writeErr => {
                    if (writeErr) {
                        console.error('Error writing to db.json:', writeErr);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.json(updatedNote);
                });
            } else {
                res.status(404).json({ error: 'Note not found' });
            }
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

function generateUniqueId() {
    return uuidv4();
}
