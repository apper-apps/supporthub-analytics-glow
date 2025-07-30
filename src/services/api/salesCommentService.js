import { toast } from "react-toastify";
import React from "react";

class SalesCommentService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'sales_comment';
  }

  async getByAppId(appId) {
    try {
      const numericAppId = parseInt(appId);
      if (isNaN(numericAppId)) return [];

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "comment" } },
          { field: { Name: "sales_status" } },
          { field: { Name: "author_name" } },
          { field: { Name: "author_avatar" } },
          { field: { Name: "created_at" } },
          { field: { Name: "updated_at" } },
          { field: { Name: "app_id" } }
        ],
        where: [
          {
            FieldName: "app_id",
            Operator: "EqualTo",
            Values: [numericAppId]
          }
        ]
      };

const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.results || [];
    } catch (error) {
      console.error("Error fetching sales comments:", error?.response?.data?.message || error.message);
      toast.error("Failed to load sales comments");
      return [];
    }
  }

  async create(commentData) {
    try {
      console.error("Create operation blocked: Application is in read-only mode");
      toast.error("Cannot create sales comment: Database is in read-only mode");
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

  async update(id, commentData) {
    try {
      console.error(`Update operation blocked for sales comment ID ${id}: Application is in read-only mode`);
      toast.error("Cannot update sales comment: Database is in read-only mode");
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
          console.error(`Failed to delete sales comments ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length === ids.length;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting sales comments:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
    }
  }
}

export default new SalesCommentService();