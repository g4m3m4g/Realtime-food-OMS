import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { format } from "date-fns";
import Loading from "./Loading";
import { toast } from "react-toastify";

const FormOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    const ordersRef = collection(db, "order");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error("Real-time orders fetch error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderProductDetails = (products) => {
    return products
      .map((product) => `${product.name} ${product.quantity}`)
      .join(", ");
  };

  const handleServeOrder = async (orderId, tableNumber) => {
    toast.success(`Order is out to serve to table ${tableNumber}`,{closeOnClick:true})
    try {
      const orderRef = doc(db, "order", orderId);
      await updateDoc(orderRef, { status: "Delivering" });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error)
    }
  };

  const handleDeleteTableOrders = async () => {
    if (!selectedTable) {
      toast.error("Please select table number",{
        closeOnClick: true,
      })
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete all orders for table ${selectedTable}?`
      )
    ) {
      try {
        const ordersRef = collection(db, "order");
        const q = query(ordersRef, where("tableNumber", "==", selectedTable));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );

        await Promise.all(deletePromises);

        toast.success(`All orders for table ${selectedTable} have been deleted.`

        )
        setSelectedTable(""); // Reset selected table
      } catch (error) {
        console.error("Error deleting orders:", error);
        toast.error("Could not delete orders. Please try again.");
      }
    }
  };

  if (loading) return <Loading />;

  const uniqueTableNumbers = [...new Set(orders.map((order) => order.tableNumber))];

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Customer Orders
          </h2>
        </div>
        <div className="p-4">
          <div className="flex gap-4 items-center mb-4">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="border rounded-lg  px-3 py-2"
            >
              <option value="">Select Table</option>
              {uniqueTableNumbers.map((table) => (
                <option className="rounded-lg" key={table} value={table}>
                  Table {table}
                </option>
              ))}
            </select>
            <button
              onClick={handleDeleteTableOrders}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Orders
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {["Table", "Products", "Order At", "Status", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.tableNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.products
                      ? renderProductDetails(order.products)
                      : "No products"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(order.createdAt.toDate(), "MM/dd/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.status || "Pending"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button
                      onClick={() =>{
                        handleServeOrder(order.id, order.tableNumber);
                      }}
                      className="bg-white text-gray-500 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <img
                        src="https://www.svgrepo.com/show/390074/food-dish-hand-serve.svg"
                        alt="Serve Order"
                        className="h-8 w-8"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No orders found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormOrders;
