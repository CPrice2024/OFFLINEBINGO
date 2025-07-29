import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";

import Topbar from "../../components/TopBar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../styles/creditStyle.css";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaUser, FaUsers, FaChartLine, FaCreditCard } from "react-icons/fa";
import { BiSearch } from "react-icons/bi"
import { AuthContext } from "../../context/AuthContext";

const MainDashboardPage = () => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCut, setTotalCut] = useState(0);
  const [cutToday, setCutToday] = useState(0);
  const [cutWeek, setCutWeek] = useState(0);
  const [cutMonth, setCutMonth] = useState(0);
  const [emailFilter, setEmailFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [topbarKey] = useState(0);
  const { user, userRole, userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const userName = user?.name ;
  const limit = 20;
  const cutChartData = [
  { name: "Today", value: parseFloat(cutToday.toFixed(2)) },
  { name: "This Week", value: parseFloat(cutWeek.toFixed(2)) },
  { name: "This Month", value: parseFloat(cutMonth.toFixed(2)) },
  { name: "Total", value: parseFloat(totalCut.toFixed(2)) },
];
const PIE_COLORS = ["#4caf50", "#006fcaff", "#ff9800", "#920000", "#580068ff", "#1ecfe7ff", "#795548"];



  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Credit Transactions Report", 14, 10);
    doc.autoTable({
      head: [["#", "Sender", "Receiver", "Amount", "Commission", "Cut", "Date"]],
      body: transactions.map((tx, idx) => [
        idx + 1,
        tx.senderEmail,
        tx.receiverEmail,
        tx.amount,
        `${tx.commission || 0}%`,
        ((tx.amount * (tx.commission || 0)) / 100).toFixed(2),
        new Date(tx.createdAt).toLocaleString(),
      ]),
    });
    doc.save("transactions_report.pdf");
  };

  const fetchBalanceFromBackend = async () => {
    try {
      const res = await axios.get("/founder/balance");
      setBalance(res.data.balance);
    } catch {
      setBalance(null);
    }
  };
    const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };
  const [activeIndex, setActiveIndex] = useState(null);
  useEffect(() => {
    if (!userId) {
      navigate("/main/dashboard");
    }
  }, [userId, navigate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/founder/transactions", {
        params: {
          page,
          limit,
          email: emailFilter,
          startDate,
          endDate,
        },
        withCredentials: true,
      });

      const txList = res.data.transactions || [];
      setTransactions(txList);
      computeReceiverCutData(txList);
      setTotal(res.data.total || 0);

      const now = new Date();
      const today = now.toDateString();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let sum = 0, todaySum = 0, weekSum = 0, monthSum = 0;

      for (const tx of txList) {
        const date = new Date(tx.createdAt);
        const cut = tx.commission ? (tx.amount * tx.commission) / 100 : 0;
        sum += cut;
        if (date.toDateString() === today) todaySum += cut;
        if (date >= startOfWeek) weekSum += cut;
        if (date >= startOfMonth) monthSum += cut;
      }

      setTotalCut(sum);
      setCutToday(todaySum);
      setCutWeek(weekSum);
      setCutMonth(monthSum);

      const creditSum = txList.reduce((acc, tx) => acc + tx.amount, 0);
      setTotalAmount(creditSum);

    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const [receiverCutData, setReceiverCutData] = useState([]);

const computeReceiverCutData = (transactions) => {
  const receiverMap = {};

  transactions.forEach((tx) => {
    const cut = tx.commission ? (tx.amount * tx.commission) / 100 : 0;
    if (!receiverMap[tx.receiverEmail]) {
      receiverMap[tx.receiverEmail] = 0;
    }
    receiverMap[tx.receiverEmail] += cut;
  });

  const chartData = Object.entries(receiverMap).map(([email, value]) => ({
    name: email,
    value: parseFloat(value.toFixed(2)),
  }));

  setReceiverCutData(chartData);
};


  useEffect(() => {
    const delay = setTimeout(() => fetchTransactions(), 500);
    return () => clearTimeout(delay);
  }, [page, emailFilter, startDate, endDate]);

  useEffect(() => {
    fetchBalanceFromBackend();
  }, []);


    const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      navigate("/main/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const Sidebar = () => (
    <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      <div class="sidebar-top">
        <button class="sidebar-toggle"></button>
        </div>
      <nav className="sidebar-nav">
        <button onClick={() => navigate("/main/dashboard")} className="sidebar-link">
          <FaUsers className="nav-icon" />
          {sidebarOpen && <span className="nav-label">Dashboard</span>}
        </button>
        <button onClick={() => navigate("/main/Users")} className="sidebar-link">
          <FaChartLine className="nav-icon" />
          {sidebarOpen && <span className="nav-label">Users</span>}
        </button>
        <button onClick={() => navigate("/main/Credit")} className="sidebar-link">
          <FaCreditCard className="nav-icon" />
          {sidebarOpen && <span className="nav-label">Credit</span>}
        </button>
      </nav>
      <div className="sidebar-profile">
        <FaUser className="profile-icon" />
        {sidebarOpen && (
          <div>
            <p className="profile-name">{userName}</p>
            <p className="profile-role">Company</p>
          </div>
        )}
      </div>
      <button className="logout-button" onClick={handleLogout}>
        <svg stroke="#7a0000" fill="#7a0000" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path></svg>
        {sidebarOpen && "Logout"}
      </button>
    </div>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="dashboard-layout">
      <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userName={userName}
              userRole={userRole}
              userEmail={user?.email}
              userId={userId}
              handleLogout={handleLogout}
       />
      <div className="main-content">
        <Topbar 
        key={topbarKey}
        isCollapsed={!sidebarOpen}
        userName={userName}
        userRole={userRole}
        userId={userId}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
         />
        <div className="credit-container">
          <div className="credit-header">
            <h1 className="dashboard-title">Dashboard</h1>
            </div>
          <div className="balance-summary">
            <div className="balance-card">
              <span className="card-label">Current Balance</span>
              <span className="card-value">
                {balance !== null ? `${parseFloat(balance).toFixed(1)} Birr` : "Loading..."}
              </span>
            </div>
          </div>

          <section className="transactions-section">
            <h3>Sales Amount Summary</h3>
            <div className="cut-summary-grid">
              <div className="cut-card">
                <h4>Today</h4>
                <p>{cutToday.toFixed(2)} Birr</p>
              </div>
              <div className="cut-card">
                <h4>This Week</h4>
                <p>{cutWeek.toFixed(2)} Birr</p>
              </div>
              <div className="cut-card">
                <h4>This Month</h4>
                <p>{cutMonth.toFixed(2)} Birr</p>
              </div>
              <div className="cut-card">
                <h4>Total</h4>
                <p>{totalCut.toFixed(2)} Birr</p>
              </div>
            </div>
            <div className="pie-charts-container">
  <div className="pie-chart-card">
    <h4 className="chart-title">Sales Distribution / Time</h4>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={cutChartData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          fill="#4caf50"
          label
        >
          {cutChartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

<div className="pie-chart-card">
      <h4 className="chart-title">Sales Distribution / Agent</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={receiverCutData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            innerRadius={60}
            label
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            activeIndex={activeIndex}
            activeShape={(props) => (
              <g>
                <text x={props.cx} y={props.cy} dy={8} textAnchor="middle" fill="">
                  {props.name}
                </text>
                <Sector
                  cx={props.cx}
                  cy={props.cy}
                  innerRadius={60}
                  outerRadius={100} 
                  startAngle={props.startAngle}
                  endAngle={props.endAngle}
                  fill={props.fill}
                />
              </g>
            )}
          >
            {receiverCutData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />

            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
</div>

            <div className="filters">
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  placeholder="Filter by email"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>
              <div className="input-icon-wrapper">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="input-icon-wrapper">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <table className="transaction-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Credit Amount</th>
                  <th>Commission</th>
                  <th>Sales Amount(Birr)</th>
                  <th>Direction</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8">Loading...</td></tr>
                ) : transactions.length > 0 ? (
                  transactions.map((tx, idx) => {
                    const cut = tx.commission ? (tx.amount * tx.commission) / 100 : 0;
                    const isFounderToSupport = user?.email === tx.senderEmail;
                    return (
                      <tr key={tx._id}>
                        <td>{(page - 1) * limit + idx + 1}</td>
                        <td>{tx.senderEmail}</td>
                        <td>{tx.receiverEmail}</td>
                        <td>{tx.amount}</td>
                        <td>{tx.commission ? `${tx.commission}%` : "-"}</td>
                        <td>{cut.toFixed(2)}</td>
                        <td>{isFounderToSupport ? "Credit" : "Debit"}</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="8">No transactions found</td></tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Prev</button>
              <span>{page} / {totalPages || 1}</span>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MainDashboardPage;
