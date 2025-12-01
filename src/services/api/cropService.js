import { getApperClient } from '@/services/apperClient';

export const cropService = {
  async getAll() {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "scientific_name_c"}},
          {"field": {"Name": "family_c"}},
          {"field": {"Name": "variety_c"}},
          {"field": {"Name": "planting_date_c"}},
          {"field": {"Name": "harvest_date_c"}},
          {"field": {"Name": "yield_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await apperClient.fetchRecords('crops_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching crops:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "scientific_name_c"}},
          {"field": {"Name": "family_c"}},
          {"field": {"Name": "variety_c"}},
          {"field": {"Name": "planting_date_c"}},
          {"field": {"Name": "harvest_date_c"}},
          {"field": {"Name": "yield_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "Tags"}}
        ]
      };

      const response = await apperClient.getRecordById('crops_c', id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching crop ${id}:`, error);
      throw error;
    }
  },

  async create(data) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include updateable fields
      const params = {
        records: [{
          Name: data.name,
          scientific_name_c: data.scientificName,
          family_c: data.family,
          variety_c: data.variety,
          planting_date_c: data.plantingDate,
          harvest_date_c: data.harvestDate,
          yield_c: data.yield ? parseFloat(data.yield) : null,
          notes_c: data.notes,
          Tags: data.tags || ""
        }]
      };

      const response = await apperClient.createRecord('crops_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} crops:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return successful[0]?.data;
      }

      return null;
    } catch (error) {
      console.error("Error creating crop:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Only include updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.name,
          scientific_name_c: data.scientificName,
          family_c: data.family,
          variety_c: data.variety,
          planting_date_c: data.plantingDate,
          harvest_date_c: data.harvestDate,
          yield_c: data.yield ? parseFloat(data.yield) : null,
          notes_c: data.notes,
          Tags: data.tags || ""
        }]
      };

      const response = await apperClient.updateRecord('crops_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} crops:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return successful[0]?.data;
      }

      return null;
    } catch (error) {
      console.error("Error updating crop:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = await getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('crops_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting crop:", error);
      throw error;
    }
  }
};