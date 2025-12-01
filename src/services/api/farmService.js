import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const farmService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('farm_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "total_area_c"}},
          {"field": {"Name": "soil_type_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching farms:", error?.response?.data?.message || error);
      toast.error("Failed to load farms");
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('farm_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "total_area_c"}},
          {"field": {"Name": "soil_type_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Farm not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching farm ${id}:`, error?.response?.data?.message || error);
      throw new Error("Farm not found");
    }
  },

  async create(farmData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: farmData.name,
          location_c: farmData.location,
          total_area_c: parseFloat(farmData.totalArea),
          soil_type_c: farmData.soilType
        }]
      };

      const response = await apperClient.createRecord('farm_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} farms: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to create farm");
    } catch (error) {
      console.error("Error creating farm:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, farmData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: farmData.name,
          location_c: farmData.location,
          total_area_c: parseFloat(farmData.totalArea),
          soil_type_c: farmData.soilType
        }]
      };

      const response = await apperClient.updateRecord('farm_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} farms: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to update farm");
    } catch (error) {
      console.error("Error updating farm:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('farm_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} farms: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting farm:", error?.response?.data?.message || error);
      return false;
    }
  }
};