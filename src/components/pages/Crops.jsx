import React, { useEffect, useState } from "react";
import { cropService } from "@/services/api/cropService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FloatingActionButton from "@/components/molecules/FloatingActionButton";
import FormField from "@/components/molecules/FormField";
import ProgressBar from "@/components/molecules/ProgressBar";
import { formatDate, getCropGrowthStage, getDaysUntilHarvest } from "@/utils/dateUtils";

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [deletingCrop, setDeletingCrop] = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    scientificName: "",
    family: "",
    variety: "",
    plantingDate: "",
    harvestDate: "",
    yield: "",
    notes: "",
    tags: ""
  });

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await cropService.getAll();
      setCrops(data);
    } catch (err) {
      console.error("Failed to load crops:", err);
      setError("Failed to load crops. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.Id, form);
        setCrops(prev => 
          prev.map(c => c.Id === editingCrop.Id ? updatedCrop : c)
        );
        toast.success("Crop updated successfully!");
      } else {
        const newCrop = await cropService.create(form);
        setCrops(prev => [newCrop, ...prev]);
        toast.success("Crop created successfully!");
      }
      
      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save crop:", err);
      toast.error("Failed to save crop. Please try again.");
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setForm({
      name: crop.Name || "",
      scientificName: crop.scientific_name_c || "",
      family: crop.family_c || "",
      variety: crop.variety_c || "",
      plantingDate: crop.planting_date_c || "",
      harvestDate: crop.harvest_date_c || "",
      yield: crop.yield_c?.toString() || "",
      notes: crop.notes_c || "",
      tags: crop.Tags || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (crop) => {
    if (!confirm(`Are you sure you want to delete "${crop.Name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingCrop(crop.Id);
    
    try {
      await cropService.delete(crop.Id);
      setCrops(prev => prev.filter(c => c.Id !== crop.Id));
      toast.success("Crop deleted successfully!");
    } catch (err) {
      console.error("Failed to delete crop:", err);
      toast.error("Failed to delete crop. Please try again.");
    } finally {
      setDeletingCrop(null);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      scientificName: "",
      family: "",
      variety: "",
      plantingDate: "",
      harvestDate: "",
      yield: "",
      notes: "",
      tags: ""
    });
    setEditingCrop(null);
  };

  const getStatusBadge = (crop) => {
    if (!crop.planting_date_c) {
      return <Badge variant="outline">Not Planted</Badge>;
    }

    const stage = getCropGrowthStage(crop.planting_date_c, crop.harvest_date_c);
    
    switch (stage) {
      case 'planted':
        return <Badge className="status-planted text-white">Planted</Badge>;
      case 'growing':
        return <Badge className="status-growing text-white">Growing</Badge>;
      case 'ready':
        return <Badge className="status-ready text-white">Ready to Harvest</Badge>;
      case 'harvested':
        return <Badge className="status-harvested text-white">Harvested</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getGrowthProgress = (crop) => {
    if (!crop.planting_date_c || !crop.harvest_date_c) return 0;
    
    const now = new Date();
    const plantDate = new Date(crop.planting_date_c);
    const harvestDate = new Date(crop.harvest_date_c);
    
    const totalDays = (harvestDate - plantDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now - plantDate) / (1000 * 60 * 60 * 24);
    
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  const familyOptions = [
    { value: "Solanaceae", label: "Solanaceae (Nightshade)" },
    { value: "Brassicaceae", label: "Brassicaceae (Mustard)" },
    { value: "Fabaceae", label: "Fabaceae (Legume)" },
    { value: "Cucurbitaceae", label: "Cucurbitaceae (Gourd)" },
    { value: "Rosaceae", label: "Rosaceae (Rose)" },
    { value: "Poaceae", label: "Poaceae (Grass)" },
    { value: "Apiaceae", label: "Apiaceae (Carrot)" },
    { value: "Amaranthaceae", label: "Amaranthaceae (Amaranth)" },
    { value: "Asteraceae", label: "Asteraceae (Sunflower)" },
    { value: "Chenopodiaceae", label: "Chenopodiaceae (Goosefoot)" }
  ];

  if (loading) {
    return <Loading message="Loading your crops..." variant="list" />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadCrops} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                Crop Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track your crops from planting to harvest
              </p>
            </div>
            
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              variant="primary"
              size="sm"
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Add Crop
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {crops.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <Empty
              title="No crops yet"
              description="Start by adding your first crop to begin tracking your agricultural production."
              icon="Sprout"
              actionText="Add Your First Crop"
              onAction={() => {
                resetForm();
                setShowModal(true);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map(crop => {
              const progress = getGrowthProgress(crop);
              const daysUntilHarvest = getDaysUntilHarvest(crop.harvest_date_c);
              
              return (
                <div key={crop.Id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 card-hover overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {crop.Name}
                        </h3>
                        {crop.scientific_name_c && (
                          <p className="text-sm text-gray-500 italic mb-2">
                            {crop.scientific_name_c}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(crop)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleEdit(crop)}
                          className="p-2 text-gray-400 hover:text-secondary-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ApperIcon name="Edit2" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(crop)}
                          disabled={deletingCrop === crop.Id}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingCrop === crop.Id ? (
                            <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                          ) : (
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {crop.variety_c && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Tag" className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Variety: {crop.variety_c}</span>
                        </div>
                      )}
                      
                      {crop.family_c && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="TreePine" className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Family: {crop.family_c}</span>
                        </div>
                      )}

                      {crop.planting_date_c && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Calendar" className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Planted: {formatDate(crop.planting_date_c)}</span>
                        </div>
                      )}

                      {crop.harvest_date_c && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="Calendar" className="h-4 w-4 mr-2 text-gray-400" />
                          <span>
                            {daysUntilHarvest > 0 
                              ? `Harvest in ${daysUntilHarvest} days` 
                              : `Harvest: ${formatDate(crop.harvest_date_c)}`
                            }
                          </span>
                        </div>
                      )}

                      {crop.yield_c && (
                        <div className="flex items-center text-sm text-gray-600">
                          <ApperIcon name="TrendingUp" className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Expected Yield: {crop.yield_c} kg</span>
                        </div>
                      )}

                      {progress > 0 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Growth Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <ProgressBar 
                            value={progress} 
                            className="growth-progress"
                          />
                        </div>
                      )}

                      {crop.notes_c && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {crop.notes_c}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCrop ? "Edit Crop" : "Add New Crop"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ApperIcon name="X" className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FormField
                      label="Crop Name"
                      name="name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Tomatoes, Corn, Wheat"
                      required
                    />
                  </div>

                  <FormField
                    label="Scientific Name"
                    name="scientificName"
                    value={form.scientificName}
                    onChange={(e) => setForm(prev => ({ ...prev, scientificName: e.target.value }))}
                    placeholder="e.g., Solanum lycopersicum"
                  />

                  <FormField
                    label="Family"
                    name="family"
                    type="select"
                    value={form.family}
                    onChange={(e) => setForm(prev => ({ ...prev, family: e.target.value }))}
                    options={familyOptions}
                  />

                  <FormField
                    label="Variety"
                    name="variety"
                    value={form.variety}
                    onChange={(e) => setForm(prev => ({ ...prev, variety: e.target.value }))}
                    placeholder="e.g., Cherokee Purple, Golden Bantam"
                  />

                  <FormField
                    label="Expected Yield (kg)"
                    name="yield"
                    type="number"
                    value={form.yield}
                    onChange={(e) => setForm(prev => ({ ...prev, yield: e.target.value }))}
                    placeholder="0"
                    step="0.1"
                    min="0"
                  />

                  <FormField
                    label="Planting Date"
                    name="plantingDate"
                    type="date"
                    value={form.plantingDate}
                    onChange={(e) => setForm(prev => ({ ...prev, plantingDate: e.target.value }))}
                  />

                  <FormField
                    label="Expected Harvest Date"
                    name="harvestDate"
                    type="date"
                    value={form.harvestDate}
                    onChange={(e) => setForm(prev => ({ ...prev, harvestDate: e.target.value }))}
                  />
                </div>

                <FormField
                  label="Tags"
                  name="tags"
                  value={form.tags}
                  onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., organic, heirloom, greenhouse"
                />

                <FormField
                  label="Notes"
                  name="notes"
                  type="textarea"
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this crop..."
                  rows={3}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                  >
                    {editingCrop ? "Update Crop" : "Create Crop"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        icon="Plus"
      />
    </div>
  );
};

export default Crops;