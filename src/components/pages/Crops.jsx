import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Textarea from '@/components/atoms/Textarea';
import Label from '@/components/atoms/Label';
import CropCard from '@/components/organisms/CropCard';
import FloatingActionButton from '@/components/molecules/FloatingActionButton';
import FormField from '@/components/molecules/FormField';
import Loading from '@/components/ui/Loading';
import ErrorView from '@/components/ui/ErrorView';
import Empty from '@/components/ui/Empty';
import { cropService } from '@/services/api/cropService';
import { fieldService } from '@/services/api/fieldService';
import { toast } from 'react-toastify';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    fieldId: '',
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'planted',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
const [cropsData, fieldsData] = await Promise.all([
        cropService.getAll(),
        fieldService.getAll()
      ]);
      setCrops(cropsData);
      // Ensure fields data is properly formatted
      const validFields = Array.isArray(fieldsData) ? fieldsData.filter(field => field && field.Id) : [];
      setFields(validFields);
    } catch (err) {
      setError(err.message);
      console.error('Error loading crops data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Crop name is required');
      return;
    }
    
    if (!formData.fieldId) {
      toast.error('Field selection is required');
      return;
    }
    
    if (!formData.plantingDate) {
      toast.error('Planting date is required');
      return;
    }
    
    if (!formData.expectedHarvestDate) {
      toast.error('Expected harvest date is required');
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (editingCrop) {
        result = await cropService.update(editingCrop.Id, formData);
        toast.success('Crop updated successfully');
      } else {
        result = await cropService.create(formData);
        toast.success('Crop created successfully');
      }
      
      await loadData();
      resetForm();
    } catch (err) {
      toast.error(editingCrop ? 'Failed to update crop' : 'Failed to create crop');
    } finally {
      setSubmitting(false);
    }
  };

const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.Name || '',
      variety: crop.variety_c || '',
      fieldId: crop.field_id_c?.Id?.toString() || '',
      plantingDate: crop.planting_date_c || '',
      expectedHarvestDate: crop.expected_harvest_date_c || '',
      status: crop.status_c || 'planted',
      notes: crop.notes_c || ''
    });
    setShowForm(true);
  };

  const handleDeleteCrop = async (crop) => {
    if (!confirm(`Are you sure you want to delete "${crop.Name}"?`)) {
      return;
    }

    try {
      const success = await cropService.delete(crop.Id);
      if (success) {
        toast.success('Crop deleted successfully');
        await loadData();
      } else {
        toast.error('Failed to delete crop');
      }
    } catch (error) {
      toast.error('Failed to delete crop');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      variety: '',
      fieldId: '',
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'planted',
      notes: ''
    });
    setEditingCrop(null);
    setShowForm(false);
  };

  const getFieldForCrop = (crop) => {
    return fields.find(field => field.Id === crop.field_id_c?.Id);
  };

  // Filter crops based on search term and status
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = !searchTerm || 
      crop.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.variety_c?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || crop.status_c === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading message="Loading crops..." />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crops</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your crop plantings and harvests
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="hidden sm:flex"
              size="sm"
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Crop
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <ApperIcon 
                  name="Search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                />
                <Input
                  type="text"
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40"
            >
              <option value="">All Status</option>
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="ready">Ready</option>
              <option value="harvested">Harvested</option>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              {filteredCrops.length} of {crops.length} crops
            </span>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {filteredCrops.length === 0 ? (
          <Empty
            title={searchTerm || statusFilter ? "No crops found" : "No crops yet"}
            description={
              searchTerm || statusFilter 
                ? "Try adjusting your search or filters"
                : "Start by adding your first crop planting"
            }
            icon="Wheat"
            action={
              !searchTerm && !statusFilter ? (
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add First Crop
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.Id}
                crop={crop}
                field={getFieldForCrop(crop)}
                onEdit={handleEditCrop}
                onView={handleEditCrop}
                className="animate-slide-up"
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton
        onClick={() => setShowForm(true)}
        icon="Plus"
        label="Add Crop"
        className="sm:hidden"
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={resetForm} />
            
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <FormField label="Crop Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tomatoes, Corn, Wheat"
                    required
                  />
                </FormField>

                <FormField label="Variety">
                  <Input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                    placeholder="e.g., Cherry, Roma, Sweet Corn"
                  />
                </FormField>
<FormField label="Field" required>
                  <Select
                    value={formData.fieldId}
                    onChange={(e) => setFormData(prev => ({ ...prev, fieldId: e.target.value }))}
                    required
                  >
                    <option value="">Select a field</option>
                    {fields.map((field) => (
                      <option key={field.Id} value={field.Id}>
                        {field.Name || 'Unnamed Field'} ({field.area_c || 0} acres)
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Planting Date" required>
                    <Input
                      type="date"
                      value={formData.plantingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, plantingDate: e.target.value }))}
                      required
                    />
                  </FormField>

                  <FormField label="Expected Harvest" required>
                    <Input
                      type="date"
                      value={formData.expectedHarvestDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedHarvestDate: e.target.value }))}
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Status">
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planted">Planted</option>
                    <option value="growing">Growing</option>
                    <option value="ready">Ready to Harvest</option>
                    <option value="harvested">Harvested</option>
                  </Select>
                </FormField>

                <FormField label="Notes">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about this crop planting..."
                    rows={3}
                  />
                </FormField>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                        {editingCrop ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <ApperIcon name={editingCrop ? "Save" : "Plus"} className="h-4 w-4 mr-2" />
                        {editingCrop ? 'Update Crop' : 'Create Crop'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation - Mobile Swipe Action */}
      <style jsx>{`
        .crop-card-swipe {
          position: relative;
          overflow: hidden;
        }
        
        .crop-card-actions {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(135deg, #E53935 0%, #D32F2F 100%);
          display: flex;
          align-items: center;
          padding: 0 1rem;
          transform: translateX(100%);
          transition: transform 0.2s ease;
        }
        
        .crop-card-swipe:hover .crop-card-actions {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
};

export default Crops;