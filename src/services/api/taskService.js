import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";

export const taskService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "crop_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "due_date_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      toast.error("Failed to load tasks");
      return [];
    }
  },

  async getByCropId(cropId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "crop_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ],
        where: [{
          "FieldName": "crop_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(cropId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks by crop:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('task_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "crop_id_c"}, "referenceField": {"field": {"Name": "Name"}}}
        ]
      });

      if (!response?.data) {
        throw new Error("Task not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      throw new Error("Task not found");
    }
  },

  async create(taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: taskData.title,
          title_c: taskData.title,
          description_c: taskData.description || "",
          due_date_c: taskData.dueDate,
          priority_c: taskData.priority || "medium",
          completed_c: false,
          crop_id_c: parseInt(taskData.cropId)
        }]
      };

      const response = await apperClient.createRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to create task");
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, taskData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.title,
          title_c: taskData.title,
          description_c: taskData.description || "",
          due_date_c: taskData.dueDate,
          priority_c: taskData.priority || "medium",
          completed_c: taskData.completed || false,
          crop_id_c: parseInt(taskData.cropId)
        }]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to update task");
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async complete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          completed_c: true
        }]
      };

      const response = await apperClient.updateRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to complete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to complete task");
    } catch (error) {
      console.error("Error completing task:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord('task_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
      return false;
    } catch (error) {
console.error("Error deleting task:", error?.response?.data?.message || error);
      return false;
    }
  }
};