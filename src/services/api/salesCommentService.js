import { toast } from 'react-toastify';

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
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching sales comments by app ID:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

  async create(comment) {
    try {
      // Only include Updateable fields
      const updateableData = {
        Name: comment.Name,
        Tags: comment.Tags,
        Owner: parseInt(comment.Owner),
        comment: comment.comment,
        sales_status: comment.sales_status,
        author_name: comment.author_name,
        author_avatar: comment.author_avatar,
        created_at: comment.created_at || new Date().toISOString(),
        updated_at: comment.updated_at || new Date().toISOString(),
        app_id: parseInt(comment.app_id)
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
          console.error(`Failed to create sales comments ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating sales comments:", error?.response?.data?.message);
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
        Id: recordId,
        updated_at: new Date().toISOString()
      };

      if (data.Name !== undefined) updateableData.Name = data.Name;
      if (data.Tags !== undefined) updateableData.Tags = data.Tags;
      if (data.Owner !== undefined) updateableData.Owner = parseInt(data.Owner);
      if (data.comment !== undefined) updateableData.comment = data.comment;
      if (data.sales_status !== undefined) updateableData.sales_status = data.sales_status;
      if (data.author_name !== undefined) updateableData.author_name = data.author_name;
      if (data.author_avatar !== undefined) updateableData.author_avatar = data.author_avatar;
      if (data.created_at !== undefined) updateableData.created_at = data.created_at;
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
          console.error(`Failed to update sales comments ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating sales comments:", error?.response?.data?.message);
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