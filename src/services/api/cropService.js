import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const cropService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('crop_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "variety_c"}},
          {"field": {"Name": "planting_date_c"}},
          {"field": {"Name": "expected_harvest_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "field_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
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
      console.error("Error fetching crops:", error?.response?.data?.message || error);
      toast.error("Failed to load crops");
      return [];
    }
  },

  async getByFieldId(fieldId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('crop_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "variety_c"}},
          {"field": {"Name": "planting_date_c"}},
          {"field": {"Name": "expected_harvest_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "field_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "field_id_c",
          "Operator": "EqualTo", 
          "Values": [parseInt(fieldId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching crops by field:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('crop_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "variety_c"}},
          {"field": {"Name": "planting_date_c"}},
          {"field": {"Name": "expected_harvest_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "field_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });

      if (!response?.data) {
        throw new Error("Crop not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching crop ${id}:`, error?.response?.data?.message || error);
      throw new Error("Crop not found");
    }
  },

  async create(cropData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: cropData.name,
          variety_c: cropData.variety || "",
          planting_date_c: cropData.plantingDate,
          expected_harvest_date_c: cropData.expectedHarvestDate,
          notes_c: cropData.notes || "",
          status_c: cropData.status || "planted",
          field_id_c: parseInt(cropData.fieldId)
        }]
      };

      const response = await apperClient.createRecord('crop_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} crops: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to create crop");
    } catch (error) {
      console.error("Error creating crop:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, cropData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: cropData.name,
          variety_c: cropData.variety || "",
          planting_date_c: cropData.plantingDate,
          expected_harvest_date_c: cropData.expectedHarvestDate,
          notes_c: cropData.notes || "",
          status_c: cropData.status || "planted",
          field_id_c: parseInt(cropData.fieldId)
        }]
      };

      const response = await apperClient.updateRecord('crop_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} crops: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to update crop");
    } catch (error) {
      console.error("Error updating crop:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('crop_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} crops: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting crop:", error?.response?.data?.message || error);
      return false;
    }
  }
};