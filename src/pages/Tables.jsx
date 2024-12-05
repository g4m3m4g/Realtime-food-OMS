import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, onSnapshot } from "firebase/firestore";

const Tables = () => {
  const [tables, setTables] = useState([]);

  const dbRef = collection(db, "table");


  const fetchTables = () => {
  
    const unsubscribe = onSnapshot(dbRef, (querySnapshot) => {

      const tablesData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.number - b.number); 

      setTables(tablesData);
    }, (error) => {
      console.error("Error fetching tables in real-time: ", error);
    });


    return () => unsubscribe();
  };

  useEffect(() => {
    const unsubscribe = fetchTables();
    return () => unsubscribe();
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500";
      case "Occupied":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };


  return (
    <>

    <div>
      <div className="p-12 ">
        <h2 className="text-2xl font-bold mb-6 text-center">Tables Status</h2>

        {/* Table Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`p-4 rounded-xl shadow-sm flex flex-col items-center transition-transform duration-150 transform hover:scale-105 hover:shadow-md hover:bg-neutral-800 ${getStatusColor(table.status)}`}
            >
              <div
                className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-gray-600"
              >
                <span className="font-semibold text-3xl">{table.number}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{`Table ${table.number}`}</h3>
              <div className={`font-semibold text-gray-600 rounded-full bg-white px-2`}>
                {table.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Tables;
