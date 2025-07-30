import { toast } from "react-toastify";
import React from "react";

class AppAILogService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'app_ai_log';
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
          { field: { Name: "summary" } },
          { field: { Name: "created_at" } },
          { field: { Name: "chat_analysis_status" } },
          { field: { Name: "sentiment_score" } },
          { field: { Name: "frustration_level" } },
          { field: { Name: "technical_complexity" } },
          { field: { Name: "model_used" } },
          { field: { Name: "error_message" } },
          { field: { Name: "app_id" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching AI logs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }
  async create(item) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: item.Name,
        Tags: item.Tags,
        Owner: parseInt(item.Owner),
        summary: item.summary,
        created_at: item.created_at || new Date().toISOString(),
        chat_analysis_status: item.chat_analysis_status,
        sentiment_score: parseFloat(item.sentiment_score) || 0,
        frustration_level: parseInt(item.frustration_level) || 0,
        technical_complexity: parseInt(item.technical_complexity) || 0,
        model_used: item.model_used,
        error_message: item.error_message,
        app_id: parseInt(item.app_id)
      };

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create AI logs ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating AI logs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
    }
  }

  async update(id, data) {
    try {
      const recordId = parseInt(id);
      if (isNaN(recordId)) return null;

      // Only include Updateable fields
      const updateableData = {
        Id: recordId
      };

      if (data.Name !== undefined) updateableData.Name = data.Name;
      if (data.Tags !== undefined) updateableData.Tags = data.Tags;
      if (data.Owner !== undefined) updateableData.Owner = parseInt(data.Owner);
      if (data.summary !== undefined) updateableData.summary = data.summary;
      if (data.created_at !== undefined) updateableData.created_at = data.created_at;
      if (data.chat_analysis_status !== undefined) updateableData.chat_analysis_status = data.chat_analysis_status;
      if (data.sentiment_score !== undefined) updateableData.sentiment_score = parseFloat(data.sentiment_score);
      if (data.frustration_level !== undefined) updateableData.frustration_level = parseInt(data.frustration_level);
      if (data.technical_complexity !== undefined) updateableData.technical_complexity = parseInt(data.technical_complexity);
      if (data.model_used !== undefined) updateableData.model_used = data.model_used;
      if (data.error_message !== undefined) updateableData.error_message = data.error_message;
      if (data.app_id !== undefined) updateableData.app_id = parseInt(data.app_id);

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update AI logs ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating AI logs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
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
          console.error(`Failed to delete AI logs ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length === ids.length;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting AI logs:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
    }
  }
}

export default new AppAILogService();