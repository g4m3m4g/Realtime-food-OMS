import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

const FormInput = () => {
  const [addForm, setAddForm] = useState({ name: "", imageUrl: "", quantity:"" });
  const [editForm, setEditForm] = useState({ name: "", imageUrl: "", quantity: "" });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const dbRef = collection(db, "product");

  useEffect(() => {
    const unsub = loadRealtime();
    return () => {
      unsub();
    };
  }, []);

  const loadRealtime = () => {
    const unsub = onSnapshot(dbRef, (snapshot) => {
      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(newData);
    });

    return () => {
      unsub();
    };
  };

  const handleAddChange = (e) => {
    setAddForm({
      ...addForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddData = async () => {
    if (!addForm.name || !addForm.imageUrl || !addForm.quantity) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      await addDoc(dbRef, addForm);
      setAddForm({ name: "", imageUrl: "", quantity: "" });
    } catch (err) {
      console.error("Error adding document:", err);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditForm({
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: item.quantity || "",
    });
  };

  const handleSave = async (id) => {
    try {
      await updateDoc(doc(dbRef, id), editForm);
      setEditId(null);
      setEditForm({ name: "", imageUrl: "", quantity: "" });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(dbRef, id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditForm({ name: "", imageUrl: "", quantity: "" });
  };

  return (
    <div className="p-4">
 <div className="p-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-center">
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
      <input
        onChange={handleAddChange}
        name="name"
        value={addForm.name}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Product name"
      />
    </div>
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Image URL
      </label>
      <input
        onChange={handleAddChange}
        name="imageUrl"
        value={addForm.imageUrl}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Product image URL"
      />
    </div>
    <div>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Quantity
      </label>
      <input
        onChange={handleAddChange}
        name="quantity"
        value={addForm.quantity}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="text"
        placeholder="Product quantity"
      />
    </div>
    <div className="flex items-center">
      {addForm.imageUrl && (
        <img
          src={addForm.imageUrl}
          alt="Preview"
          className="h-20 w-20 object-cover border rounded-md"
        />
      )}
    </div>
  </div>
  <button
    onClick={handleAddData}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full sm:w-auto"
  >
    Add
  </button>
</div>

      <hr className="mb-4" />
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">No.</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Image</th>
            <th className="border px-4 py-2">Quantity</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{index + 1}</td>
              <td className="border px-4 py-2">
                {editId === item.id ? (
                  <input
                    onChange={handleEditChange}
                    value={editForm.name}
                    name="name"
                    className="shadow appearance-none border rounded h-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                ) : (
                  item.name
                )}
              </td>
              <td className="border px-4 py-2">
                {editId === item.id ? (
                  <input
                    onChange={handleEditChange}
                    value={editForm.imageUrl}
                    name="imageUrl"
                    className="shadow appearance-none border rounded h-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                ) : (
                  <img
                    src={item.imageUrl}
                    alt="Image"
                    className="h-auto w-20 object-cover rounded-md"
                  />
                )}
              </td>
              <td className="border px-4 py-2">
                {editId === item.id ? (
                  <input
                    onChange={handleEditChange}
                    value={editForm.quantity}
                    name="quantity"
                    className="shadow appearance-none border rounded h-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="border px-4 py-2">
                {editId === item.id ? (
                  <>
                    <button
                      onClick={() => handleSave(item.id)}
                      className="bg-green-600 text-white font-bold rounded-md px-2 py-1 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 text-white font-bold rounded-md px-2 py-1"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-600 text-white font-bold rounded-md px-2 py-1 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-600 text-white font-bold rounded-md px-2 py-1"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormInput;
