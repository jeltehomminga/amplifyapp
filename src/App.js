import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import { API } from "aws-amplify";
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
    const fetchNotes = async () => {
      const apiData = await API.graphql({ query: listNotes });
      setNotes(apiData.data.listNotes.items);
    };
    fetchNotes();
  }, []);

  const createNote = async () => {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
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

      <button onClick={createNote}>Create Note</button>

      <div>
        {notes.map((note) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={deleteNote}>Delete note</button>
          </div>
        ))}
      </div>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
