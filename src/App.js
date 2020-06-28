import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import { API, Storage } from "aws-amplify";
import React, { useEffect, useState } from "react";
import "./App.css";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

const initialFormState = { name: "", description: "" };

function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const image = await Storage.get(note.image);
          note.image = image;
        }
        return note;
      })
    );
    setNotes(apiData.data.listNotes.items);
  }

  const createNote = async () => {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setNotes([...notes, formData]);
    setFormData(initialFormState);
  };

  const deleteNote = async ({ id }) => {
    const newNotesArray = notes.filter((note) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  };

  const onChange = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    setFormData({ ...formData, image: file.name });
    await Storage.put(file.name, file);
    fetchNotes();
  };

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input
        onChange={({ target: { value } }) =>
          setFormData({ ...formData, name: value })
        }
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={({ target: { value } }) =>
          setFormData({ ...formData, description: value })
        }
        placeholder="Note description"
        value={formData.description}
      />
      <input type="file" onChange={onChange} />
      <button onClick={createNote}>Create new note</button>
      <div>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={() => deleteNote(note.id)}>Delete note</button>
            {/* // eslint-disable-next-line jsx-a11y/alt-text */}
            {note.image && <img src={note.image} style={{ width: 400 }} />}
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
