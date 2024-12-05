import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc,
  query, 
  where, 
  doc, 
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import Loading from '../components/Loading';
import NotFound from '../components/NotFound'
import Footer from "../components/Footer";
import { toast } from "react-toastify";

const Ordering = () => {
  const { tableNumber } = useParams();
  const [tableData, setTableData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState(null);

  // Fetch table data by tableNumber
  const fetchTableData = async () => {
    try {
      const tablesRef = collection(db, "table");
      const q = query(tablesRef, where("number", "==", parseInt(tableNumber)));
      const tableSnapshot = await getDocs(q);
      if (!tableSnapshot.empty) {
        setTableData({ id: tableSnapshot.docs[0].id, ...tableSnapshot.docs[0].data() });
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      alert("Could not fetch table data");
    }
  };

  // Real-time listener for products
  useEffect(() => {
    const productsRef = collection(db, "product");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setProducts(productList);
      
      // Update order quantities based on new product list
      setOrderQuantities(prev => {
        const updatedQuantities = {...prev};
        productList.forEach(product => {
          // If product doesn't exist in previous quantities or quantity exceeds new stock
          if (!prev[product.id] || prev[product.id] > (product.quantity || 0)) {
            updatedQuantities[product.id] = 0;
          }
        });
        return updatedQuantities;
      });
    }, (error) => {
      console.error("Error fetching products:", error);
      alert("Could not fetch menu items");
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Real-time listener for order status
  useEffect(() => {
    if (!tableData) return;

    const ordersRef = collection(db, "order");
    const q = query(
      ordersRef, 
      where("tableNumber", "==", tableNumber),
      where("status", "!=", null)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Get the most recent order for this table
        const latestOrderDoc = snapshot.docs
          .sort((a, b) => b.data().createdAt - a.data().createdAt)[0];
        
        const latestOrder = latestOrderDoc.data();
        setOrderStatus(latestOrder.status);
        setLatestOrderId(latestOrderDoc.id);
      }
    }, (error) => {
      console.error("Error tracking order status:", error);
    });

    return () => unsubscribe();
  }, [tableData, tableNumber]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchTableData();
      setLoading(false);
    };
    fetchData();
  }, [tableNumber]);

  // Handle quantity changes
  const handleQuantityChange = (productId, change) => {
    // Prevent quantity changes if there's an active order
    if (orderStatus && ['Pending', 'Delivering'].includes(orderStatus)) {
      toast.error("Please receive your current order first");
      return;
    }

    setOrderQuantities(prev => {
      const currentProduct = products.find(p => p.id === productId);
      const currentQuantity = prev[productId] || 0;
      
      // Ensure quantity doesn't go below 0 or exceed available stock
      const newQuantity = Math.max(0, 
        Math.min(currentQuantity + change, currentProduct.quantity || 0)
      );

      return {
        ...prev,
        [productId]: newQuantity
      };
    });
  };

  // Open review order modal
  const openReviewModal = () => {
    // Prevent opening review modal if there's an active order
    if (orderStatus && ['Pending', 'Delivering'].includes(orderStatus)) {
      toast.error("Please receive your current order first");
      return;
    }
    setIsReviewModalOpen(true);
  };

  // Close review order modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const submitOrder = async () => {
    // Prevent order submission if there's an active order
    if (orderStatus && ['Pending', 'Delivering'].includes(orderStatus)) {
      toast.error("Please receive your current order first");
      return;
    }

    if (orderPlaced) return; // Prevent duplicate submissions
    setOrderPlaced(true); // Disable button during submission
    try {
      // Prepare ordered products
      const orderedProducts = products
        .filter(product => orderQuantities[product.id] > 0)
        .map(product => ({
          id: product.id,
          name: product.name,
          quantity: orderQuantities[product.id]
        }));

      // Validate order
      if (orderedProducts.length === 0) {
        alert("Please add some items to your order");
        return;
      }

      // Create order in "order" collection
      const orderData = {
        tableNumber: tableNumber || "unknown",
        products: orderedProducts,
        createdAt: serverTimestamp(),
        status: "Pending" // Initial status
      };
      await addDoc(collection(db, "order"), orderData);

      // Update stock for each product
      for (const product of orderedProducts) {
        const productRef = doc(db, "product", product.id);
        const productSnapshot = await getDoc(productRef);
        
        if (productSnapshot.exists()) {
          const currentStock = productSnapshot.data().quantity;
          const newQuantity = Math.max(currentStock - product.quantity, 0);
          
          await updateDoc(productRef, { quantity: newQuantity });
        } else {
          console.error(`Product with ID ${product.id} not found`);
        }
      }

      // Reset order quantities
      setOrderQuantities(
        products.reduce((acc, product) => {
          acc[product.id] = 0;
          return acc;
        }, {})
      );

      // Close review modal
      setIsReviewModalOpen(false);

      toast.success("Order Placed Successfully")
    } catch (error) {
      console.error(error);
    } finally {
      setOrderPlaced(false); // Re-enable button
    }
  };

  // New method to receive the order
  const handleOrderReceive = async () => {
    if (!latestOrderId) {
      toast.error("No active order found");
      return;
    }

    try {
      const orderRef = doc(db, "order", latestOrderId);
      await updateDoc(orderRef, {
        status: "Served"
      });

      toast.success("Order marked as received");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Could not update order status");
    }
  };

  // Get order items for review
  const getOrderItems = () => {
    return products
      .filter(product => orderQuantities[product.id] > 0)
      .map(product => ({
        ...product,
        quantity: orderQuantities[product.id]
      }));
  };

  const renderOrderStatusBadge = () => {
    if (!orderStatus) return null;

    const statusColors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Delivering: "bg-green-200 text-green-900 border-green-300",
      Served: "bg-blue-100 text-blue-800 border-blue-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusColorClass = 
      statusColors[orderStatus] || "bg-gray-100 text-gray-800 border-gray-200";

    return (
      <div className="w-full flex flex-col items-center my-4 space-y-2">
        <div 
          className={`
            ${statusColorClass} 
            px-1 py-2 
            rounded-full 
            text-sm 
            font-semibold 
            shadow-md 
            border 
            flex 
            items-center 
            justify-center 
            max-w-xs 
            w-full
          `}
        >
          {orderStatus === "Pending" && (
            <div className="mr-2"></div>
          )}
          Order Status: {orderStatus}
        </div>

        {/* Add Order Receive button for Delivering status */}
        {orderStatus === "Delivering" && (
          <button 
            onClick={handleOrderReceive}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Order Received
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!tableData) {
    return <NotFound/>
  }

  return (
    <>
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome to Table {tableData.number}</h1>
      <p className="text-gray-600 mb-6">Status: {tableData.status}</p>
      {renderOrderStatusBadge()}
      <div >
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-center">Image</th>
              <th className="px-4 py-3 text-center">Quantity</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-semibold">{product.name}</div>
                    {product.quantity <= 10 && (
                      <div className="text-xs text-red-500 mt-1">
                        Low on stock ({product.quantity} remaining)
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 flex justify-center">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-auto h-16 object-cover rounded" 
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium">{orderQuantities[product.id]}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-2">
                    <button 
                      className="bg-red-500 text-white w-8 h-8 rounded flex items-center justify-center 
                        disabled:bg-red-300 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={
                        orderQuantities[product.id] <= 0 || 
                        (orderStatus && ['Pending', 'Delivering'].includes(orderStatus))
                      }
                    >
                      -
                    </button>
                    <button 
                      className="bg-green-500 text-white w-8 h-8 rounded flex items-center justify-center 
                        disabled:bg-green-300 disabled:cursor-not-allowed"
                      onClick={() => handleQuantityChange(product.id, 1)}
                      disabled={
                        product.quantity <= orderQuantities[product.id] || 
                        (orderStatus && ['Pending', 'Delivering'].includes(orderStatus))
                      }
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={openReviewModal}
          className="bg-yellow-400 text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={
            !getOrderItems().length || 
            (orderStatus && ['Pending', 'Delivering'].includes(orderStatus))
          }
        >
          Review Order
        </button>
      </div>

      {/* Review Order Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>
            <div className="space-y-4">
              {getOrderItems().map((item) => (
                <div key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button 
                onClick={closeReviewModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={orderPlaced}
                className={`px-4 py-2 rounded-md ${orderPlaced ? "bg-gray-300" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                onClick={submitOrder}
              >
                {orderPlaced ? "Submitting..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      <Footer/>
    </>
  );
};

export default Ordering;