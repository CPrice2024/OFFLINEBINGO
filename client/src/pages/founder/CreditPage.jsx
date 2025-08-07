import { useRef } from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import Topbar from "../../components/TopBar";
import transferImage from "../../assets/style1.png";

import jsPDF from "jspdf";
import "jspdf-autotable";
import "../../styles/creditStyle.css";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaUser, FaUsers, FaChartLine, FaCreditCard  } from "react-icons/fa";
import {MdLogout } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import emailIcon from "../../assets/mail (1).png";
import creditIcon from "../../assets/coin.png";


import { AuthContext } from "../../context/AuthContext";

const CreditPage = () => {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [emailFilter, setEmailFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, userRole, userName, userId} = useContext(AuthContext);
  const [topbarKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
const [balance, setBalance] = useState(null);

  const limit = 20;

  const [totalCut, setTotalCut] = useState(0);

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

    const sum = txList.reduce((acc, tx) => acc + tx.amount, 0);
    setTotalAmount(sum);

    const cutSum = txList.reduce((acc, tx) => {
      const cut = tx.commission ? (tx.amount * tx.commission) / 100 : 0;
      return acc + cut;
    }, 0);
    setTotalCut(cutSum);

    setTransactions(txList);
    setTotal(res.data.total || 0);
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  } finally {
    setLoading(false);
  }
};

const fetchBalanceFromBackend = async () => {
  try {
    const res = await axios.get("/founder/balance");
    console.log("✅ Fetched balance:", res.data); 
    setBalance(res.data.balance);
  } catch (err) {
    console.error("❌ Failed to fetch balance:", err);
    setBalance(null);
  }
};

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, emailFilter, startDate, endDate]);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  useEffect(() => {
    console.log("🔄 Fetching founder balance...");
  fetchBalanceFromBackend();
}, []);


  const Sidebar = () => (
      <div className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-top">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            
          </button>
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
    const handleLogout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
      navigate("/main/signin");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

const handleTransfer = async () => {
  const parsedAmount = parseFloat(amount);

  if (
    !receiverEmail ||
    isNaN(parsedAmount) ||
    parsedAmount === 0 ||
    parsedAmount < -50000 ||
    parsedAmount > 100000
  ) {
    setStatus("❌ Enter an amount between -50000 and 100000 (non-zero)");
    return;
  }

  // Optional frontend safeguard (won't deduct balance on negative credit)
  if (parsedAmount > 0 && parsedAmount > balance) {
    setStatus("❌ Insufficient balance for this transfer.");
    return;
  }

  try {
    const res = await axios.post(
      "/transfer",
      {
        receiverEmail,
        amount: parsedAmount,
      },
      { withCredentials: true }
    );

    setStatus(`✅ ${res.data.message}`);
    setReceiverEmail("");
    setAmount("");
    fetchTransactions();
    await fetchBalanceFromBackend(); 
  } catch (err) {
    setStatus(`❌ ${err.response?.data?.message || "Transfer failed"}`);
  }
};



  const totalPages = Math.ceil(total / limit);

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
        
        key={topbarKey}
        isCollapsed={!sidebarOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="credit-container">
        <h1 className="dashboard-title">Credit Management</h1>
        <div className="balance-summary">
  <div className="balance-card">
    <span className="card-label">Current Balance</span>
    <span className="card-value">{balance !== null ? `${parseFloat(balance).toFixed(1)} Birr` : "Loading..."}</span>
  </div>

  <div
    className="status-card"
    style={{
      borderColor: balance < 10000 ? "#ca0011ff" : "#2a8600ff"
    }}
  >
    <span className="card-label">Status</span>
    <span
      className="card-value status-value"
      style={{
        color: balance < 10000 ? "#db0315ff" : "#2e9100ff"
      }}
    >
      {balance < 10000 ? "Low Balance" : "Sufficient"}
    </span>
  </div>
</div>
        <section className="transfer-section">
  <div className="transfer-wrapper">
    <div className="transfer-form-container">
      <h2>Transfer</h2>
      <div className="form-group input-icon-wrapper">
        <label>Agent Email</label>
        <img src={emailIcon} alt="Email Icon" className="input-icon-image" />
        <input
          type="email"
          value={receiverEmail}
          onChange={(e) => setReceiverEmail(e.target.value)}
          placeholder="Ha-Hu@example.com"
          required
        />
      </div>

      <div className="form-group input-icon-wrapper">
        <label>Credit Amount (Birr)</label>
        <img src={creditIcon} alt="Credit Icon" className="input-icon-image" />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          min="-50000"
          max="100000"
          required
        />
      </div>

      <button
        className="send-button"
        onClick={handleTransfer}
        disabled={
  !receiverEmail ||
  isNaN(parseFloat(amount)) ||
  parseFloat(amount) === 0 ||
  parseFloat(amount) < -50000 ||
  parseFloat(amount) > 100000
}

      >
        Transfer
      </button>

      {status && <p className="status-message">{status}</p>}
    </div>
    <div className="transfer-image-container">
      <img src={transferImage} alt="Transfer Illustration" className="transfer-image" />
    </div>
  </div>
</section>


        <section className="transactions-section">
          <h3>Transactions History</h3>
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
  <div className="total-amount-display">
  <strong className="title">Total Sales Amount:</strong> {totalCut.toFixed(2)} Birr
</div>
  <div className="total-amount-display">
  <strong className="title">Total Credit Amount:</strong> {totalAmount} Birr
</div>



          <table className="transaction-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Sender</th>
      <th>Receiver</th>
      <th>Amount (Birr)</th>
      <th>Commission</th>
      <th>Sales (Birr)</th>
      <th>Purpose</th> 
      <th>Direction</th> 
      <th>Date & Time</th>
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr>
        <td colSpan="7">Loading...</td>
      </tr>
    ) : transactions.length > 0 ? (
      transactions.map((tx, idx) => {
        const isFounderToSupport = user?.email === tx.senderEmail;
        const cut = tx.commission ? (tx.amount * tx.commission) / 100 : 0;
        return (
          <tr key={tx._id}>
            <td>{(page - 1) * limit + idx + 1}</td>
            <td style={{ whiteSpace: "nowrap" }}>{tx.senderEmail}</td>
            <td style={{ whiteSpace: "nowrap" }}>{tx.receiverEmail}</td>
            <td>{tx.amount}</td>
            <td>{tx.commission ? `${tx.commission}%` : "-"}</td>
            <td>{cut.toFixed(2)}</td> 
            <td>Transfer</td> 
            <td>{isFounderToSupport ? "Credit" : "Debit"}</td> 
            <td>{new Date(tx.createdAt).toLocaleString()}</td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="7">No transactions Data</td>
      </tr>
    )}
  </tbody>
</table>


          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
              Prev
            </button>
            <span>
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </section>
      </div>
      </div>
      </div>
  );
};

export default CreditPage;
