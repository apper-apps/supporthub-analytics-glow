import { toast } from 'react-toastify';

class AppService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'app';
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
          { field: { Name: "app_name" } },
          { field: { Name: "app_category" } },
          { field: { Name: "is_db_connected" } },
          { field: { Name: "canvas_app_id" } },
          { field: { Name: "total_messages" } },
          { field: { Name: "last_message_at" } },
          { field: { Name: "last_chat_analysis_status" } },
          { field: { Name: "last_ai_scan_date" } },
          { field: { Name: "created_at" } },
          { field: { Name: "sales_status" } },
          { field: { Name: "user_id" } }
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
        console.error("Error fetching apps:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const recordId = parseInt(id);
      if (isNaN(recordId)) return null;

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "app_name" } },
          { field: { Name: "app_category" } },
          { field: { Name: "is_db_connected" } },
          { field: { Name: "canvas_app_id" } },
          { field: { Name: "total_messages" } },
          { field: { Name: "last_message_at" } },
          { field: { Name: "last_chat_analysis_status" } },
          { field: { Name: "last_ai_scan_date" } },
          { field: { Name: "created_at" } },
          { field: { Name: "sales_status" } },
          { field: { Name: "user_id" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, recordId, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching app with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(item) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: item.Name,
        Tags: item.Tags,
        Owner: parseInt(item.Owner),
        app_name: item.app_name,
        app_category: item.app_category,
        is_db_connected: Boolean(item.is_db_connected),
        canvas_app_id: item.canvas_app_id,
        total_messages: parseInt(item.total_messages) || 0,
        last_message_at: item.last_message_at || new Date().toISOString(),
        last_chat_analysis_status: item.last_chat_analysis_status,
        last_ai_scan_date: item.last_ai_scan_date || new Date().toISOString(),
        created_at: item.created_at || new Date().toISOString(),
        sales_status: item.sales_status,
        user_id: parseInt(item.user_id)
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
          console.error(`Failed to create apps ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating apps:", error?.response?.data?.message);
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
      if (data.app_name !== undefined) updateableData.app_name = data.app_name;
      if (data.app_category !== undefined) updateableData.app_category = data.app_category;
      if (data.is_db_connected !== undefined) updateableData.is_db_connected = Boolean(data.is_db_connected);
      if (data.canvas_app_id !== undefined) updateableData.canvas_app_id = data.canvas_app_id;
      if (data.total_messages !== undefined) updateableData.total_messages = parseInt(data.total_messages);
      if (data.last_message_at !== undefined) updateableData.last_message_at = data.last_message_at;
      if (data.last_chat_analysis_status !== undefined) updateableData.last_chat_analysis_status = data.last_chat_analysis_status;
      if (data.last_ai_scan_date !== undefined) updateableData.last_ai_scan_date = data.last_ai_scan_date;
      if (data.created_at !== undefined) updateableData.created_at = data.created_at;
      if (data.sales_status !== undefined) updateableData.sales_status = data.sales_status;
      if (data.user_id !== undefined) updateableData.user_id = parseInt(data.user_id);

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
          console.error(`Failed to update apps ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating apps:", error?.response?.data?.message);
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
          console.error(`Failed to delete apps ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length === ids.length;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting apps:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
    }
  }
}

export default new AppService();