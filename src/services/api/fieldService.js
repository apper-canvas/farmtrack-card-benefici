import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const fieldService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('field_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "area_c"}},
          {"field": {"Name": "coordinates_c"}},
          {"field": {"Name": "farm_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
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
      console.error("Error fetching fields:", error?.response?.data?.message || error);
      toast.error("Failed to load fields");
      return [];
    }
  },

  async getByFarmId(farmId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('field_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "area_c"}},
          {"field": {"Name": "coordinates_c"}},
          {"field": {"Name": "farm_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "farm_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(farmId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching fields by farm:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('field_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "area_c"}},
          {"field": {"Name": "coordinates_c"}},
          {"field": {"Name": "farm_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });

      if (!response?.data) {
        throw new Error("Field not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching field ${id}:`, error?.response?.data?.message || error);
      throw new Error("Field not found");
    }
  },

  async create(fieldData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: fieldData.name,
          area_c: parseFloat(fieldData.area),
          coordinates_c: fieldData.coordinates || "",
          farm_id_c: parseInt(fieldData.farmId)
        }]
      };

      const response = await apperClient.createRecord('field_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} fields: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to create field");
    } catch (error) {
      console.error("Error creating field:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, fieldData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: fieldData.name,
          area_c: parseFloat(fieldData.area),
          coordinates_c: fieldData.coordinates || "",
          farm_id_c: parseInt(fieldData.farmId)
        }]
      };

      const response = await apperClient.updateRecord('field_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} fields: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to update field");
    } catch (error) {
      console.error("Error updating field:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('field_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} fields: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting field:", error?.response?.data?.message || error);
      return false;
    }
  }
};