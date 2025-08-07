import React, { useEffect, useState, useContext } from "react";
import { getAllGameSummaries } from "../../utils/indexedDB";
import axios from "../../api/axios";
import "../../styles/supportResultsStyle.css";
import dailyIcon from "../../assets/daily.png";
import weeklyIcon from "../../assets/weekly.png";
import yearlyIcon from "../../assets/yearly.png";
import totalIcon from "../../assets/total.png";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/TopBar";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaTrophy,
  FaPercent,
  FaUsers,
  FaMoneyBill,
  FaClock,
  FaIdCard,
  FaFilePdf,
} from "react-icons/fa";

const SupportResultsPage = () => {
  const [results, setResults] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [commissionStats, setCommissionStats] = useState({
    daily: "0.00",
    weekly: "0.00",
    yearly: "0.00",
    total: "0.00",
    dailyTotal: "0.00",
    weeklyTotal: "0.00",
    yearlyTotal: "0.00",
    grandTotal: "0.00",
  });
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, userRole, userId } = useContext(AuthContext);
  const userName = user?.name;

useEffect(() => {
  const fetchResults = async () => {
    try {
      if (navigator.onLine) {
        // 🌐 Online: get data from MongoDB
        const res = await axios.get("/game-results/support-results", {
          withCredentials: true,
        });
        setResults(res.data);
        setFiltered(res.data);
        computeStats(res.data);
      } else {
        // 📴 Offline: get data from IDB
        const offlineData = await getAllGameSummaries(); 
        if (offlineData.length > 0) {
          // Normalize to match structure used in computeStats
          const normalized = offlineData.map((item, i) => ({
            _id: `offline-${i}`,
            commissions: ((item.eachCardAmount || 0) * (item.cardCount || 0) * (item.commissionPercent || 0)) / 100,
            commissionPercent: item.commissionPercent || 0,
            cardCount: item.cardCount || 0,
            cardAmount: item.eachCardAmount || 0,
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setResults(normalized);
          setFiltered(normalized);
          computeStats(normalized);
        } else {
          setResults([]);
          setFiltered([]);
        }
      }
    } catch (err) {
      console.error("Error fetching game results:", err);
    }
  };

  fetchResults();
}, []);


  const computeStats = (data) => {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Calculate commission stats
    const total = data.reduce((sum, r) => sum + (r.commissions || 0), 0);
    const daily = data
      .filter((r) => new Date(r.createdAt) >= startOfDay)
      .reduce((sum, r) => sum + (r.commissions || 0), 0);
    const weekly = data
      .filter((r) => new Date(r.createdAt) >= startOfWeek)
      .reduce((sum, r) => sum + (r.commissions || 0), 0);
    const yearly = data
      .filter((r) => new Date(r.createdAt) >= startOfYear)
      .reduce((sum, r) => sum + (r.commissions || 0), 0);

    // Calculate total amount stats (before commission)
    const grandTotal = data.reduce((sum, r) => {
      const totalAmount = r.commissionPercent > 0 
        ? r.commissions / (r.commissionPercent / 100) 
        : 0;
      return sum + (totalAmount || 0);
    }, 0);
    
    const dailyTotal = data
      .filter((r) => new Date(r.createdAt) >= startOfDay)
      .reduce((sum, r) => {
        const totalAmount = r.commissionPercent > 0 
          ? r.commissions / (r.commissionPercent / 100) 
          : 0;
        return sum + (totalAmount || 0);
      }, 0);
      
    const weeklyTotal = data
      .filter((r) => new Date(r.createdAt) >= startOfWeek)
      .reduce((sum, r) => {
        const totalAmount = r.commissionPercent > 0 
          ? r.commissions / (r.commissionPercent / 100) 
          : 0;
        return sum + (totalAmount || 0);
      }, 0);
      
    const yearlyTotal = data
      .filter((r) => new Date(r.createdAt) >= startOfYear)
      .reduce((sum, r) => {
        const totalAmount = (r.commissions / r.commissionPercent )
          ? r.commissions / (r.commissionPercent / 100) 
          : 0;
        return sum + (totalAmount || 0);
      }, 0);

    setCommissionStats({
      daily: daily.toFixed(2),
      weekly: weekly.toFixed(2),
      yearly: yearly.toFixed(2),
      total: total.toFixed(2),
      dailyTotal: dailyTotal.toFixed(2),
      weeklyTotal: weeklyTotal.toFixed(2),
      yearlyTotal: yearlyTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    });
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      navigate("/support/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    const f = results.filter((r) => {
      const time = new Date(r.createdAt);
      return (!start || time >= start) && (!end || time <= end);
    });

    setFiltered(f);
    computeStats(f);
    setCurrentPage(1);
  };

  const paginatedResults = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToPDF = () => {
    const input = document.querySelector(".results-table");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      pdf.save("support_results.pdf");
    });
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="dashboard-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userName={userName}
        userRole={userRole}
        userId={userId}
        handleLogout={handleLogout}
      />
      <div className="main-content">
        <Topbar
          isCollapsed={!sidebarOpen}
          userName={userName}
          userRole={userRole}
          userId={userId}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="support-results-page">
          <div className="stats-cards">
            <div className="stat-cardd">
              <img src={dailyIcon} alt="daily" />
              <div>
                <h4>Daily Commission</h4>
                <p>{commissionStats.daily} ብር</p>
                <h4>Daily Total Sales</h4>
                <p>{commissionStats.dailyTotal} ብር</p>
              </div>
            </div>
            <div className="stat-cardd">
              <img src={weeklyIcon} alt="weekly" />
              <div>
                <h4>Weekly Commission</h4>
                <p>{commissionStats.weekly} ብር</p>
                <h4>Weekly Total Sales</h4>
                <p>{commissionStats.weeklyTotal} ብር</p>
              </div>
            </div>
            <div className="stat-cardd">
              <img src={yearlyIcon} alt="yearly" />
              <div>
                <h4>Yearly Commission</h4>
                <p>{commissionStats.yearly} ብር</p>
                <h4>Yearly Total Sales</h4>
                <p>{commissionStats.yearlyTotal} ብር</p>
              </div>
            </div>
            <div className="stat-cardd">
              <img src={totalIcon} alt="total" />
              <div>
                <h4>Total Commission</h4>
                <p>{commissionStats.total} ብር</p>
                <h4>Grand Total Sales</h4>
                <p>{commissionStats.grandTotal} ብር</p>
              </div>
            </div>
          </div>

          <div className="filter-bar">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
            <button onClick={handleFilter}>Filter</button>
            <button onClick={() => {
              setStartDate("");
              setEndDate("");
              setFiltered(results);
              computeStats(results);
            }}>Clear</button>
          </div>

          <div className="navigation-buttons">
            <button onClick={exportToPDF}>
              <FaFilePdf /> Export to PDF
            </button>
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th><FaIdCard /> No</th>
                <th><FaTrophy /> Game ID</th>
                <th><FaPercent /> Commission</th>
                <th><FaUsers /> Players</th>
                <th><FaMoneyBill /> sales</th>
                <th><FaMoneyBill /> Total Amount</th>
                <th><FaClock /> Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.map((r, index) => {
                const totalAmount = (r.cardCount)
                  ? (r.commissions / (r.commissionPercent / 100)).toFixed(2)
                  : "0.00";
                
                return (
                  <tr key={r._id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{r._id}</td>
                    <td className="icon-style">{r.commissionPercent}%</td>
                    <td className="icon-style">{r.cardCount}</td>
                    <td className="icon-style">{r.commissions?.toFixed(2)}</td>
                    <td className="icon-style">{totalAmount}</td>
                    <td className="icon-style">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "active" : ""}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportResultsPage;