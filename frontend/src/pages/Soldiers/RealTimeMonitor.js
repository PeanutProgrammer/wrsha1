// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";

// const socket = io("localhost:4001", {
//   transports: ["websocket"],
// });

// export default function RealTimeMonitor() {
//   const [soldiers, setSoldiers] = useState([]);
//   const [recentEvents, setRecentEvents] = useState([]);

//   // Fetch soldiers from backend
//   const fetchSoldiers = async () => {
//     try {
//       const res = await axios.get("localhost:4001/soldierLog");
//       setSoldiers(res.data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     }
//   };

//   // Listen for real-time updates
//   useEffect(() => {
//     fetchSoldiers();

//     socket.on("soldiersUpdated", () => {
//       console.log("Soldiers Updated — refreshing list...");
//       fetchSoldiers(); // Refresh UI
//       addRecentEvent();
//     });

//     return () => socket.off("soldiersUpdated");
//   }, []);

//   // Push temporary highlight event
//   const addRecentEvent = () => {
//     const id = Date.now();

//     setRecentEvents((prev) => [
//       ...prev,
//       { id, timestamp: new Date().toLocaleTimeString() },
//     ]);

//     // Remove highlight after 6 seconds
//     setTimeout(() => {
//       setRecentEvents((prev) => prev.filter((e) => e.id !== id));
//     }, 6000);
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.title}>📡 حركة الدخول والخروج — لحظيًا</h2>

//       {/* Recent movement notification */}
//       <div style={styles.eventContainer}>
//         {recentEvents.map((e) => (
//           <div key={e.id} style={styles.flashBox}>
//             <span>تم تحديث الحركة — {e.timestamp}</span>
//           </div>
//         ))}
//       </div>

//       {/* Soldiers Table */}
//       <table style={styles.table}>
//         <thead>
//           <tr>
//             <th>الرقم العسكري</th>
//             <th>الرتبة</th>
//             <th>الاسم</th>
//             <th>الفرع</th>
//             <th>النوع</th>
//             <th>الوقت</th>
//             <th>السبب</th>
//             <th>ملاحظات</th>
//           </tr>
//         </thead>

//         <tbody>
//           {soldiers.map((s, index) => (
//             <tr key={index}>
//               <td>{s.mil_id}</td>
//               <td>{s.rank}</td>
//               <td>{s.name}</td>
//               <td>{s.department}</td>
//               <td
//                 style={
//                   s.event_type === "arrival" ? styles.inCell : styles.outCell
//                 }
//               >
//                 {s.event_type === "arrival" ? "دخول" : "خروج"}
//               </td>
//               <td>{new Date(s.event_time).toLocaleString()}</td>
//               <td>{s.reason || "-"}</td>
//               <td>{s.notes || "-"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// // --------------------
// // Inline styles
// // --------------------

// const styles = {
//   container: {
//     padding: "20px",
//     fontFamily: "Arial",
//     direction: "rtl",
//   },

//   title: {
//     textAlign: "center",
//     marginBottom: "20px",
//     fontSize: "26px",
//     fontWeight: "bold",
//   },

//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     fontSize: "18px",
//   },

//   inCell: {
//     backgroundColor: "#c8f7c5",
//     fontWeight: "bold",
//   },

//   outCell: {
//     backgroundColor: "#f7c5c5",
//     fontWeight: "bold",
//   },

//   eventContainer: {
//     marginBottom: "10px",
//   },

//   flashBox: {
//     padding: "10px",
//     marginBottom: "5px",
//     backgroundColor: "#ffeaa7",
//     borderRadius: "5px",
//     animation: "fadeOut 6s forwards",
//   },
// };
