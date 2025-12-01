import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const laborService = {
  async getAllRecords() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "hours_worked_c"}},
          {"field": {"Name": "rate_c"}},
          {"field": {"Name": "total_cost_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        orderBy: [{
          "fieldName": "date_c",
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords('labor_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching labor records:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(recordId) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "hours_worked_c"}},
          {"field": {"Name": "rate_c"}},
          {"field": {"Name": "total_cost_c"}},
          {"field": {"Name": "task_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };

      const response = await apperClient.getRecordById('labor_c', recordId, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching labor record ${recordId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(laborData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Calculate total cost if not provided
      const totalCost = laborData.total_cost_c || (laborData.hours_worked_c * laborData.rate_c);

      const params = {
        records: [{
          Name: laborData.Name || laborData.description_c,
          date_c: laborData.date_c,
          description_c: laborData.description_c,
          hours_worked_c: parseFloat(laborData.hours_worked_c),
          rate_c: parseFloat(laborData.rate_c),
          total_cost_c: parseFloat(totalCost),
          task_c: laborData.task_c,
          notes_c: laborData.notes_c
        }]
      };

      const response = await apperClient.createRecord('labor_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} labor records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating labor record:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(recordId, laborData) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Calculate total cost if not provided
      const totalCost = laborData.total_cost_c || (laborData.hours_worked_c * laborData.rate_c);

      const params = {
        records: [{
          Id: recordId,
          Name: laborData.Name || laborData.description_c,
          date_c: laborData.date_c,
          description_c: laborData.description_c,
          hours_worked_c: parseFloat(laborData.hours_worked_c),
          rate_c: parseFloat(laborData.rate_c),
          total_cost_c: parseFloat(totalCost),
          task_c: laborData.task_c,
          notes_c: laborData.notes_c
        }]
      };

      const response = await apperClient.updateRecord('labor_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} labor records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating labor record:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(recordId) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [recordId]
      };

      const response = await apperClient.deleteRecord('labor_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} labor records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error("Error deleting labor record:", error?.response?.data?.message || error);
      throw error;
    }
  }
};