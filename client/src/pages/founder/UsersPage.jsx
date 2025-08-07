import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "../../styles/dashboardStyle.css";
import { FiMoreVertical } from "react-icons/fi";
import { MdEmail, MdPhone, MdClose } from "react-icons/md";
import { AuthContext } from "../../context/AuthContext";
import { FaUser, FaUsers, FaChartLine, FaCreditCard, FaRegChartBar, FaMapMarkerAlt, FaRegIdCard, FaEllipsisH } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import TopBar from "../../components/TopBar";

const Users = () => {
  const [supports, setSupports] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateSupport, setShowCreateSupport] = useState(false);
  const [editingSupport, setEditingSupport] = useState(null);
  const { userName, userRole, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [topbarKey] = useState(0);
  const itemsPerPage = 10;
  const [alert, setAlert] = useState({ message: "", type: "" });


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    commission: "",
    city: "",
    superAgentName: "",
    bingoCardType: "A100",
  });

  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const menuRefs = useRef({});

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedInsideAny = Object.values(menuRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
      if (!clickedInsideAny) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch supports
  const fetchSupports = async () => {
    try {
      const res = await axios.get("/auth/support");
      setSupports(res.data);
    } catch (error) {
      console.error("Failed to fetch supports:", error);
    }
  };

  useEffect(() => {
    if (alert.message) {
      const timeout = setTimeout(() => setAlert({ message: "", type: "" }), 3000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

useEffect(() => {
  if (userRole !== "founder") {
    navigate("/main/signin");
    return;
  }
  fetchSupports();
}, [userRole, navigate]);



  // Auth check + fetch
  useEffect(() => {
    if (userRole !== "founder") {
      navigate("/main/signin");
      return;
    }
    fetchSupports();
  }, [userRole, navigate]);

  const deleteSupport = async (id) => {
    if (window.confirm("Are you sure you want to delete this Agent?")) {
      try {
        await axios.delete(`/auth/support/${id}`);
        fetchSupports();
      } catch (error) {
        console.error("Failed to delete Agent:", error);
      }
    }
  };

 const filteredSupports = supports.filter((support) => {
  const searchTerm = search.trim().toLowerCase();

  const matchesSearch =
    !searchTerm ||
    [
      support.name,
      support.email,
      support.phone,
      support.superAgentName,
      support.city,
      support.bingoCardType,
      support.commission?.toString(),
    ].some((field) => field?.toLowerCase().includes(searchTerm));

  const matchesDate =
    !dateFilter || support.createdAt.slice(0, 10) === dateFilter;

  return matchesSearch && matchesDate;
});

  const totalPages = Math.ceil(filteredSupports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSupports = filteredSupports.slice(indexOfFirstItem, indexOfLastItem);

  const clearFilters = () => {
    setSearch("");
    setDateFilter("");
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSupportSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupport) {
        await axios.put(`/auth/support/${editingSupport._id}`, formData);
        setAlert({ message: "Support updated successfully!", type: "success" });
      } else {
        await axios.post("/auth/support/signup", formData);
        setAlert({ message: "Support created successfully!", type: "success" });
      }

      setFormData({ name: "", email: "", phone: "", password: "", commission: "", city: "", bingoCardType: "A100", superAgentName: "" });
      setEditingSupport(null);
      setShowCreateSupport(false);
      fetchSupports();
    } catch (error) {
      setAlert({ message: "Failed to submit. Please check the input.", type: "error" });
      console.error("Submit support error:", error);
    }
  };

  const handleEditSupport = (support) => {
    setFormData({
      name: support.name,
      email: support.email,
      phone: support.phone,
      password: "",
      commission: support.commission ?? "",
      city: support.city ?? "",
      superAgentName: support.superAgentName || "",


      bingoCardType: support.bingoCardType || "A100",
    });
    setEditingSupport(support);
    setShowCreateSupport(true);
  };

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
      <div className="sidebar-top">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} />
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

  return (
    <div className={`dashboard-layout ${showCreateSupport ? "blurred" : ""}`}>
      
      <Sidebar />
      <div className="main-content">
        <TopBar
          userId={user?._id}
          key={topbarKey}
          isCollapsed={!sidebarOpen}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="dashboard-main">
          <h1 className="dashboard-title">User Management</h1>

          <div className="dashboard-filters">
            <input
              type="text"
              placeholder="Search by any need"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button className="clear-button" onClick={clearFilters}>Clear Filters</button>
            <button
              className="create-support-button"
              onClick={() => {
                setEditingSupport(null);
                setFormData({ name: "", email: "", phone: "", password: "", commission: "", city: "", bingoCardType: "A100", superAgentName: "" });
                setShowCreateSupport(true);
              }}
            >
              + Create Agent
            </button>
          </div>

          <p className="summary-text">
            Showing <strong className="highlight">{filteredSupports.length}</strong> of <strong className="highlight">{supports.length}</strong> Agent
          </p>

          <div className="dashboard-table-container">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th><FaUser /> Name</th>
                  <th><MdEmail /> Email</th>
                  <th><MdPhone /> Phone</th>
                  <th><FaChartLine /> Balance</th>
                  <th>% Commission</th>
                  <th><FaMapMarkerAlt /> City</th>
                  <th><FaUser /> Role</th>
                  <th> SuperAgent</th>
                  <th>Cartela</th>
                  <th><AiOutlineCalendar /> Created</th>
                  <th> Actions</th>
                </tr>
              </thead>
              <tbody>
  {currentSupports.length > 0 ? (
    currentSupports.map((support, index) => (
      <tr key={support._id}>
        <td>{indexOfFirstItem + index + 1}</td>
        <td>{support.name}</td>
        <td>{support.email}</td>
        <td>{support.phone}</td>
        <td
          style={{
            color: support.balance < 50 ? "#96010dff" : "#2c8a00ff",
            fontWeight: "bold",
          }}
        >
          Br {support.balance?.toLocaleString() ?? "0"}
        </td>
        <td>{support.commission ? `${support.commission}%` : "-"}</td>
        <td>{support.city}</td>
        <td>{support.role || "agent"}</td>
        <td>{support.superAgentName || "-"}</td>
        <td>{support.bingoCardType}</td>
        <td>{support.createdAt.slice(0, 10)}</td>
        <td style={{ position: "relative" }}>
  <button
    onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
    className="action-dots-btn"
  >
    {/* Settings icon SVG */}
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#4b4b4be0" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  </button>
  {openMenuIndex === index && (
    <div
      ref={(el) => (menuRefs.current[index] = el)}
      className="action-dropdown"
    >
      <button
        className="dropdown-item"
        onClick={() => {
          handleEditSupport(support);
          setOpenMenuIndex(null);
        }}
      >
        Edit
      </button>
      <button
        className="dropdown-item"
        onClick={() => {
          deleteSupport(support._id);
          setOpenMenuIndex(null);
        }}
      >
        Delete
      </button>
    </div>
  )}
</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="12">No supports found.</td>
    </tr>
  )}
</tbody>

            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
      
      {showCreateSupport && (
        <div class="flag-overlay">
        <div className="create-support-modal">
          
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => {
                setShowCreateSupport(false);
                setEditingSupport(null);
                setFormData({ name: "", email: "", phone: "", password: "", commission: "", city: "", bingoCardType: "A100", superAgentName: "" });
              }}
            >
              <MdClose size={20} />
            </button>
            {alert.message && (
              <div className={`dashboard-alert ${alert.type}`}>
                {alert.message}
              </div>
            )}
            <h2>{editingSupport ? "Edit Agent" : "Create Agent"}</h2>
            <form onSubmit={handleCreateSupportSubmit}>
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required={!editingSupport} />
              <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} required />
              <input type="text" name="commission" placeholder="Commission" value={formData.commission} onChange={handleInputChange} required />
              <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required />
              <input type="text" name="superAgentName" placeholder="Super Agent Name" value={formData.superAgentName} onChange={handleInputChange} />
              <select
              name="bingoCardType"
              value={formData.bingoCardType}
              onChange={handleInputChange}
               required
               className="bingo-select"
               >
                <option value="A100">A100</option>
                <option value="A200">A200</option>
                <option value="W60">W60</option>
                <option value="R250">R250</option>
              </select>
              <button type="submit" className="modal-submit">
                {editingSupport ? "Update" : "Create"}
              </button>
            </form>
            
          </div>
          
        </div>
        </div>
        
      )}
      
    </div>
    
  );
};

export default Users;
