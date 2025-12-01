import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { laborService } from "@/services/api/laborService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import { calculateTotal } from "@/utils/currencyUtils";
import { formatDate, getCurrentMonth } from "@/utils/dateUtils";

function Labor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [laborRecords, setLaborRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('current');
  
  const [formData, setFormData] = useState({
    description_c: '',
    hours_worked_c: '',
    rate_c: '',
    task_c: '',
    notes_c: '',
    date_c: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLaborRecords();
  }, []);

  const loadLaborRecords = async () => {
    try {
      setLoading(true);
      const data = await laborService.getAllRecords();
      setLaborRecords(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load labor records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description_c || !formData.hours_worked_c || !formData.rate_c) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const laborData = {
        ...formData,
        hours_worked_c: parseFloat(formData.hours_worked_c),
        rate_c: parseFloat(formData.rate_c)
      };

      if (editingRecord) {
        await laborService.update(editingRecord.Id, laborData);
        toast.success('Labor record updated successfully');
      } else {
        await laborService.create(laborData);
        toast.success('Labor record added successfully');
      }

      await loadLaborRecords();
      resetForm();
    } catch (err) {
      toast.error(editingRecord ? 'Failed to update labor record' : 'Failed to add labor record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      description_c: record.description_c || "",
      hours_worked_c: record.hours_worked_c?.toString() || "",
      rate_c: record.rate_c?.toString() || "",
      task_c: record.task_c || "",
      notes_c: record.notes_c || "",
      date_c: record.date_c || new Date().toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (record) => {
    if (!confirm('Are you sure you want to delete this labor record?')) {
      return;
    }

    try {
      await laborService.delete(record.Id);
      toast.success('Labor record deleted successfully');
      await loadLaborRecords();
    } catch (err) {
      toast.error('Failed to delete labor record');
    }
  };

  const resetForm = () => {
    setFormData({
      description_c: '',
      hours_worked_c: '',
      rate_c: '',
      task_c: '',
      notes_c: '',
      date_c: new Date().toISOString().split('T')[0]
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getFilteredRecords = () => {
    let filtered = laborRecords;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        (record.description_c || "").toLowerCase().includes(query) ||
        (record.task_c || "").toLowerCase().includes(query) ||
        (record.notes_c || "").toLowerCase().includes(query)
      );
    }

    // Filter by month
    if (selectedMonth === 'current') {
      const { month, year } = getCurrentMonth();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date_c);
        return recordDate.getMonth() === parseInt(month) && recordDate.getFullYear() === parseInt(year);
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date_c) - new Date(a.date_c));
  };

  const getLaborSummary = () => {
    const { month, year } = getCurrentMonth();
    const currentMonthRecords = laborRecords.filter(record => {
      const recordDate = new Date(record.date_c);
      return recordDate.getMonth() === month && recordDate.getFullYear() === year;
    });

    const totalHours = laborRecords.reduce((sum, record) => sum + (record.hours_worked_c || 0), 0);
    const totalCost = laborRecords.reduce((sum, record) => sum + (record.total_cost_c || 0), 0);
    const monthlyHours = currentMonthRecords.reduce((sum, record) => sum + (record.hours_worked_c || 0), 0);
    const monthlyCost = currentMonthRecords.reduce((sum, record) => sum + (record.total_cost_c || 0), 0);
    const averageRate = totalHours > 0 ? totalCost / totalHours : 0;

    return {
      totalHours,
      totalCost,
      monthlyHours,
      monthlyCost,
      averageRate,
      totalRecords: laborRecords.length
    };
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} onRetry={loadLaborRecords} />;

  const filteredRecords = getFilteredRecords();
  const summary = getLaborSummary();
  const currentMonth = getCurrentMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Labor Management</h1>
              <p className="text-gray-600">Track labor hours, costs, and activities</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Labor Record
          </Button>
        </div>

        {/* Labor Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Hours</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.monthlyHours.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="Clock" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary.monthlyCost.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="DollarSign" className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary.averageRate.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summary.totalHours.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ApperIcon name="Users" className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Records
              </label>
              <Input
                type="text"
                placeholder="Search by description, task, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full"
              >
                <option value="current">Current Month</option>
                <option value="all">All Time</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Labor Record Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRecord ? 'Edit Labor Record' : 'Add Labor Record'}
                </h2>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  size="sm"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Description"
                  type="text"
                  name="description_c"
                  value={formData.description_c}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_c: e.target.value }))}
                  placeholder="Enter work description"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Hours Worked"
                    type="number"
                    name="hours_worked_c"
                    value={formData.hours_worked_c}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_worked_c: e.target.value }))}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    required
                  />

                  <FormField
                    label="Rate ($/hr)"
                    type="number"
                    name="rate_c"
                    value={formData.rate_c}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate_c: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <FormField
                  label="Task"
                  type="text"
                  name="task_c"
                  value={formData.task_c}
                  onChange={(e) => setFormData(prev => ({ ...prev, task_c: e.target.value }))}
                  placeholder="Enter task name"
                />

                <FormField
                  label="Date"
                  type="date"
                  name="date_c"
                  value={formData.date_c}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_c: e.target.value }))}
                  required
                />

                <FormField
                  label="Notes"
                  type="textarea"
                  name="notes_c"
                  value={formData.notes_c}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes_c: e.target.value }))}
                  placeholder="Additional notes..."
                />

                {formData.hours_worked_c && formData.rate_c && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Total Cost: <span className="font-bold text-gray-900">
                        ${(parseFloat(formData.hours_worked_c) * parseFloat(formData.rate_c)).toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                  >
                    {editingRecord ? 'Update Record' : 'Add Record'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Labor Records List */}
        <div className="bg-white rounded-xl shadow-card">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Labor Records
            </h2>
            {filteredRecords.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                {selectedMonth === 'current' && ` for ${currentMonth.name} ${currentMonth.year}`}
              </p>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {filteredRecords.length === 0 ? (
              <Empty
                title="No labor records found"
                description={
                  searchQuery
                    ? "No records match your current search."
                    : "Start tracking labor by adding your first record."
                }
                action={
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                    Add Labor Record
                  </Button>
                }
              />
            ) : (
              filteredRecords.map((record) => (
                <div key={record.Id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <ApperIcon name="Users" className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.description_c}</h3>
                          <p className="text-sm text-gray-600">
                            {record.task_c && `Task: ${record.task_c}`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-13 flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(record.date_c)}</span>
                        <span>{record.hours_worked_c} hrs @ ${record.rate_c}/hr</span>
                      </div>
                      {record.notes_c && (
                        <div className="ml-13 mt-2">
                          <p className="text-sm text-gray-600">{record.notes_c}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${record.total_cost_c?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.hours_worked_c}h
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(record)}
                          variant="outline"
                          size="sm"
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(record)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Labor;