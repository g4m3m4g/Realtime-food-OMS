import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import QRCodeModal from "./QRCodeModal";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

const FormTable = () => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState("");
  const [qrCodeData, setQrCodeData] = useState(""); 


  const dbRef = collection(db, "table");

  const fetchTables = async () => {
    try {
      const data = await getDocs(dbRef);
      const tablesData = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      tablesData.sort((a, b) => a.number - b.number);
  
      setTables(tablesData);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Add Table to Firestore
  const handleAddTable = async () => {
    if (!newTable) {
      toast.warn("Invalid Table Number!",{
        position:'bottom-center',
        closeOnClick: true
      })
      return;
    }

    const tableNumber = parseInt(newTable);

    try {
      // Check if table number already exists
      const q = query(dbRef, where("number", "==", tableNumber));
      const existingTables = await getDocs(q);

      if (!existingTables.empty) {
        toast.warn("This table is already existed",{
          position: "bottom-center",
          closeOnClick: true
        })
        return;
      }

      // Add new table
      const newTableData = {
        number: tableNumber,
        status: "Available",
      };
      await addDoc(dbRef, newTableData);
      setNewTable(""); // Clear input
      fetchTables(); // Refresh table list
    } catch (error) {
      console.error("Error adding table:", error);
    }
  };

  // Update Table Status and Generate QR Code
  const handleStatusChange = async (id, status, tableNumber) => {
    try {
      const tableDoc = doc(db, "table", id);
      await updateDoc(tableDoc, { status });

      if (status === "Occupied") {
        const baseUrl = window.location.origin;
        const token = uuidv4()
        const orderPageUrl = `${baseUrl}/tables/${tableNumber}?token=${token}`;
        setQrCodeData(orderPageUrl); // Generate QR code data
      }

      fetchTables(); // Refresh table list
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  };

  // Delete Table
  const handleDeleteTable = async (id) => {
    try {
      const tableDoc = doc(db, "table", id);
      await deleteDoc(tableDoc);
      fetchTables(); // Refresh table list
    } catch (error) {
      console.error("Error deleting table:", error);
    }
  };

  return (
    <>

      <div className="p-6">
        {/* Add Table Form */}
        <div className="mb-6">
          <h2 className="text-lg font-medium">Add New Table</h2>
          <div className="flex items-center space-x-4 mt-2">
            <input
              type="number"
              placeholder="Table Number"
              value={newTable}
              onChange={(e) => setNewTable(e.target.value)}
              className="border rounded p-2 w-1/4"
            />
            <button
              onClick={handleAddTable}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Table
            </button>
          </div>
        </div>

        {/* Tables List */}
        <div>
          <h2 className="text-lg font-medium mb-4">Manage Tables</h2>
          <table className="table-auto w-full border ">
            <thead>
              <tr className="bg-gray-200 text-left ">
                <th className="px-4 py-2">Table Number</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((table) => (
                <tr key={table.id} className="border-t">
                  <td className="px-4 py-2">{table.number}</td>
                  <td className="px-4 py-2">{table.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {/* Status Change Buttons */}
                    <button
                      onClick={() =>
                        handleStatusChange(table.id, "Available", table.number)
                      }
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Available
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(table.id, "Occupied", table.number)
                      }
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Occupied
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* QR Code Modal */}
        <QRCodeModal
          qrCodeData={qrCodeData}
          onClose={() => setQrCodeData("")}
        />
      </div>
    </>
  );
};

export default FormTable;
