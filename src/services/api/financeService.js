import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export const financeService = {
  async getAllTransactions() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('expense_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      toast.error("Failed to load transactions");
      return [];
    }
  },

  async getTransactionById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('expense_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "type_c"}}
        ]
      });

      if (!response?.data) {
        throw new Error("Transaction not found");
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      throw new Error("Transaction not found");
    }
  },

  async createTransaction(transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: transactionData.description,
          amount_c: parseFloat(transactionData.amount),
          category_c: transactionData.category,
          date_c: transactionData.date,
          description_c: transactionData.description,
          type_c: transactionData.type
        }]
      };

      const response = await apperClient.createRecord('expense_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to create transaction");
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateTransaction(id, transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: transactionData.description,
          amount_c: parseFloat(transactionData.amount),
          category_c: transactionData.category,
          date_c: transactionData.date,
          description_c: transactionData.description,
          type_c: transactionData.type
        }]
      };

      const response = await apperClient.updateRecord('expense_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      throw new Error("Failed to update transaction");
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('expense_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transactions: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getTransactionSummary() {
    try {
      const transactions = await this.getAllTransactions();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date_c);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type_c === 'income')
        .reduce((sum, t) => sum + t.amount_c, 0);

      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type_c === 'expense')
        .reduce((sum, t) => sum + t.amount_c, 0);

      const totalIncome = transactions
        .filter(t => t.type_c === 'income')
        .reduce((sum, t) => sum + t.amount_c, 0);

      const totalExpenses = transactions
        .filter(t => t.type_c === 'expense')
        .reduce((sum, t) => sum + t.amount_c, 0);

      return {
        monthlyIncome,
        monthlyExpenses,
        monthlyProfit: monthlyIncome - monthlyExpenses,
        totalIncome,
        totalExpenses,
        totalProfit: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        monthlyTransactionCount: currentMonthTransactions.length
      };
    } catch (error) {
      console.error("Error calculating transaction summary:", error);
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyProfit: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalProfit: 0,
        transactionCount: 0,
        monthlyTransactionCount: 0
      };
    }
  },

  async getTransactionsByCategory(type = null) {
    try {
      const transactions = await this.getAllTransactions();
      
      let filteredTransactions = type ? transactions.filter(t => t.type_c === type) : transactions;
      
      const categorySummary = {};
      filteredTransactions.forEach(t => {
        if (!categorySummary[t.category_c]) {
          categorySummary[t.category_c] = {
            category: t.category_c,
            total: 0,
            count: 0,
            type: t.type_c
          };
        }
        categorySummary[t.category_c].total += t.amount_c;
        categorySummary[t.category_c].count += 1;
      });

      return Object.values(categorySummary).sort((a, b) => b.total - a.total);
    } catch (error) {
      console.error("Error fetching transactions by category:", error);
      return [];
    }
  },

  async getMonthlyTrends(months = 6) {
    try {
      const transactions = await this.getAllTransactions();
      
      const trends = [];
      const now = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date_c);
          return tDate.getMonth() === month.getMonth() && 
                 tDate.getFullYear() === month.getFullYear();
        });

        const income = monthTransactions
          .filter(t => t.type_c === 'income')
          .reduce((sum, t) => sum + t.amount_c, 0);

        const expenses = monthTransactions
          .filter(t => t.type_c === 'expense')
          .reduce((sum, t) => sum + t.amount_c, 0);

        trends.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income,
          expenses,
          profit: income - expenses
        });
      }

      return trends;
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      return [];
    }
  }
};