import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import userDetailsService from "@/services/api/userDetailsService";
import FilterBar from "@/components/molecules/FilterBar";
import DataTable from "@/components/organisms/DataTable";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";

const Users = () => {
  const navigate = useNavigate();
const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


// Fetch users data with pagination and filters
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Build where conditions based on filters
      const whereConditions = [];
      
      if (searchTerm) {
        whereConditions.push({
          "FieldName": "Name",
          "Operator": "Contains",
          "Values": [searchTerm]
        });
      }
      
      if (planFilter) {
        whereConditions.push({
          "FieldName": "plan",
          "Operator": "EqualTo",
          "Values": [planFilter]
        });
      }

const params = {
        "fields": [
          { "field": { "Name": "Name" } },
          { "field": { "Name": "email" } },
          { "field": { "Name": "plan" } },
          { "field": { "Name": "total_apps" } },
          { "field": { "Name": "total_app_with_db" } },
          { "field": { "Name": "total_credits_used" } },
          { "field": { "Name": "platform_signup_date" } },
          { "field": { "Name": "apper_signup_date" } },
          { "field": { "Name": "company_id" } }
        ],
        "where": whereConditions,
        "orderBy": sortColumn ? [{
          "fieldName": sortColumn,
          "sorttype": sortDirection.toUpperCase()
        }] : [{ "fieldName": "platform_signup_date", "sorttype": "DESC" }],
        "pagingInfo": {
          "limit": itemsPerPage,
          "offset": (currentPage - 1) * itemsPerPage
        }
      };

      const response = await apperClient.fetchRecords("user_details", params);
      
      if (!response.success) {
        throw new Error(response.message);
      }

      setUsers(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, planFilter, sortColumn, sortDirection]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

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
      render: (value) => {
        if (!value) {
          return <span className="text-sm text-gray-400">N/A</span>;
        }
        
        try {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return <span className="text-sm text-gray-400">N/A</span>;
          }
          return (
            <span className="text-sm text-gray-500">
              {format(date, "MMM dd, yyyy")}
            </span>
          );
        } catch (error) {
          return <span className="text-sm text-gray-400">N/A</span>;
        }
      }
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
          data={users}
          loading={loading}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={handleUserClick}
          actions={actions}
          emptyMessage="No users found"
          emptyDescription="No users match your current filters. Try adjusting your search criteria."
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </motion.div>
    </div>
  );
};

export default Users;