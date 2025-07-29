import { toast } from 'react-toastify';

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

      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching user details:", error?.response?.data?.message);
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

      const response = await this.apperClient.getRecordById(this.tableName, recordId, params);
      
      if (!response || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching user with ID ${id}:`, error?.response?.data?.message);
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
        email: item.email,
        user_id: item.user_id,
        total_apps: parseInt(item.total_apps) || 0,
        total_app_with_db: parseInt(item.total_app_with_db) || 0,
        total_credits_used: parseInt(item.total_credits_used) || 0,
        plan: item.plan,
        platform_signup_date: item.platform_signup_date || new Date().toISOString(),
        apper_signup_date: item.apper_signup_date || new Date().toISOString(),
        company_id: item.company_id,
        company_user_id: item.company_user_id
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
          console.error(`Failed to create user details ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating user details:", error?.response?.data?.message);
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
      if (data.email !== undefined) updateableData.email = data.email;
      if (data.user_id !== undefined) updateableData.user_id = data.user_id;
      if (data.total_apps !== undefined) updateableData.total_apps = parseInt(data.total_apps);
      if (data.total_app_with_db !== undefined) updateableData.total_app_with_db = parseInt(data.total_app_with_db);
      if (data.total_credits_used !== undefined) updateableData.total_credits_used = parseInt(data.total_credits_used);
      if (data.plan !== undefined) updateableData.plan = data.plan;
      if (data.platform_signup_date !== undefined) updateableData.platform_signup_date = data.platform_signup_date;
      if (data.apper_signup_date !== undefined) updateableData.apper_signup_date = data.apper_signup_date;
      if (data.company_id !== undefined) updateableData.company_id = data.company_id;
      if (data.company_user_id !== undefined) updateableData.company_user_id = data.company_user_id;

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
          console.error(`Failed to update user details ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating user details:", error?.response?.data?.message);
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