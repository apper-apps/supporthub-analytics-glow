import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DataTable from "@/components/organisms/DataTable";
import FilterBar from "@/components/molecules/FilterBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import userDetailsService from "@/services/api/userDetailsService";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userDetailsService.getAll();
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
filtered = filtered.filter(user =>
        user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply plan filter
if (planFilter) {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, planFilter, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleUserClick = (user) => {
    navigate(`/users/${user.Id}`);
  };

const getUniquePlans = () => {
    const plans = [...new Set(users.map(user => user.plan))];
    return plans.map(plan => ({ value: plan, label: plan }));
  };

  const getPlanVariant = (plan) => {
    switch (plan.toLowerCase()) {
      case "enterprise":
        return "primary";
      case "pro":
        return "secondary";
      case "basic":
        return "info";
      case "free":
        return "default";
      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "Name",
      label: "Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {value.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </span>
          </div>
<div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
{
      key: "plan",
      label: "Plan",
      sortable: true,
      render: (value) => (
        <Badge variant={getPlanVariant(value)}>{value}</Badge>
      )
    },
{
      key: "total_apps",
      label: "Total Apps",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gray-600">{value}</span>
      )
    },
    {
      key: "total_credits_used",
      label: "Credits Used",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gray-600">{value.toLocaleString()}</span>
      )
    },
{
      key: "company_id",
      label: "Company ID",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-gray-500">{value}</span>
      )
    },
    {
      key: "platform_signup_date",
      label: "Platform Signup",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {format(new Date(value), "MMM dd, yyyy")}
        </span>
      )
    },
    {
      key: "apper_signup_date",
      label: "Apper Signup",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {format(new Date(value), "MMM dd, yyyy")}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: "Eye",
      onClick: handleUserClick
    }
  ];

  const filters = [
    {
      placeholder: "All Plans",
      value: planFilter,
      onChange: (e) => setPlanFilter(e.target.value),
      options: getUniquePlans()
    }
  ];

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={fetchUsers} />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          searchPlaceholder="Search users, emails, companies..."
          filters={filters}
          showExport={true}
          showRefresh={true}
          onRefresh={fetchUsers}
          onExport={() => {
            // Export functionality
            console.log("Export users data");
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={handleUserClick}
          actions={actions}
          emptyMessage="No users found"
          emptyDescription="No users match your current filters. Try adjusting your search criteria."
        />
      </motion.div>
    </div>
  );
};

export default Users;