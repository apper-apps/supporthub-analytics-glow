import { toast } from "react-toastify";
import React from "react";

class UserDetailsService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'user_details';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "email" } },
          { field: { Name: "user_id" } },
          { field: { Name: "total_apps" } },
          { field: { Name: "total_app_with_db" } },
          { field: { Name: "total_credits_used" } },
          { field: { Name: "plan" } },
          { field: { Name: "platform_signup_date" } },
          { field: { Name: "apper_signup_date" } },
          { field: { Name: "company_id" } },
          { field: { Name: "company_user_id" } }
        ]
      };

const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { data: [], total: 0 };
      }

      if (!response || !response.data) {
        return { data: [], total: 0 };
      }

      return {
        data: response.data,
        total: response.total || response.data.length
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user details:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error(error.message);
      }
      return { data: [], total: 0 };
    }
  }

  async create(userData) {
    try {
      console.error("Create operation blocked: Application is in read-only mode");
      toast.error("Cannot create user details: Database is in read-only mode");
      return {
        success: false,
        message: "Database is in read-only mode. Create operations are disabled.",
        results: []
      };
    } catch (error) {
      console.error("Read-only mode error:", error.message);
      toast.error("Operation not allowed in read-only mode");
      return {
        success: false,
        message: "Read-only mode: Create operations are disabled",
        results: []
      };
    }
  }

  async update(id, userData) {
    try {
      console.error(`Update operation blocked for user ID ${id}: Application is in read-only mode`);
      toast.error("Cannot update user details: Database is in read-only mode");
      return {
        success: false,
        message: "Database is in read-only mode. Update operations are disabled.",
        results: []
      };
    } catch (error) {
      console.error("Read-only mode error:", error.message);
      toast.error("Operation not allowed in read-only mode");
      return {
        success: false,
        message: "Read-only mode: Update operations are disabled",
        results: []
      };
    }
  }

  async delete(recordIds) {
    try {
      const ids = Array.isArray(recordIds) ? recordIds.map(id => parseInt(id)) : [parseInt(recordIds)];
      
      const params = {
        RecordIds: ids
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete user details ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length === ids.length;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting user details:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
    }
  }

  async getByIds(ids) {
    try {
      const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (numericIds.length === 0) return [];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "plan" } }
        ],
        where: [
          {
            FieldName: "Id",
            Operator: "ExactMatch",
            Values: numericIds,
            Include: true
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching users by IDs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
}

export default new UserDetailsService();