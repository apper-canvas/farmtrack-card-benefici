import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cropService } from "@/services/api/cropService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { formatDate } from "@/utils/dateUtils";

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCropDetails();
  }, [id]);

  const loadCropDetails = async () => {
    setLoading(true);
    setError("");
    
    try {
      const cropData = await cropService.getById(parseInt(id));
      if (cropData) {
        setCrop(cropData);
      } else {
        setError("Crop not found.");
      }
    } catch (err) {
      console.error("Failed to load crop details:", err);
      setError("Failed to load crop details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/crops");
  };

  if (loading) {
    return <Loading message="Loading crop details..." />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadCropDetails} />;
  }

  if (!crop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="Sprout" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Crop Not Found</h2>
          <p className="text-gray-600 mb-4">The crop you're looking for doesn't exist.</p>
          <Button onClick={handleBack} variant="primary">
            Back to Crops
          </Button>
        </div>
      </div>
    );
  }

  const getGrowthStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'planted':
        return 'status-planted';
      case 'growing':
        return 'status-growing';
      case 'ready':
        return 'status-ready';
      case 'harvested':
        return 'status-harvested';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
                Back to Crops
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-secondary-700 to-secondary-800 bg-clip-text text-transparent">
                  {crop.Name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Crop Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Crop Info Card */}
          <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary-100 p-4 rounded-xl">
                  <ApperIcon name="Sprout" className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{crop.Name}</h2>
                  <p className="text-gray-600">
                    {crop.variety_c && `${crop.variety_c} variety`}
                  </p>
                </div>
              </div>
              <Badge 
                variant="primary" 
                className={`text-white font-medium px-3 py-1 ${getGrowthStageColor(crop.growth_stage_c)}`}
              >
                {crop.growth_stage_c || 'Unknown'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Variety</h3>
                  <p className="text-lg text-gray-900">{crop.variety_c || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Planting Date</h3>
                  <p className="text-lg text-gray-900">
                    {crop.planting_date_c ? formatDate(crop.planting_date_c) : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Growth Stage</h3>
                  <p className="text-lg text-gray-900">{crop.growth_stage_c || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expected Harvest</h3>
                  <p className="text-lg text-gray-900">
                    {crop.expected_harvest_date_c ? formatDate(crop.expected_harvest_date_c) : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Field Location</h3>
                  <p className="text-lg text-gray-900">
                    {crop.field_id_c?.Name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <Badge variant="primary" className={`${getGrowthStageColor(crop.growth_stage_c)} text-white`}>
                    {crop.growth_stage_c || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Care Notes Card */}
          {crop.care_notes_c && (
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8">
              <div className="flex items-center mb-4">
                <ApperIcon name="FileText" className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Care Notes</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{crop.care_notes_c}</p>
              </div>
            </div>
          )}

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="Calendar" className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Planted:</span>
                  <span className="text-gray-900 font-medium">
                    {crop.planting_date_c ? formatDate(crop.planting_date_c) : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expected Harvest:</span>
                  <span className="text-gray-900 font-medium">
                    {crop.expected_harvest_date_c ? formatDate(crop.expected_harvest_date_c) : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <ApperIcon name="MapPin" className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Location</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Field:</span>
                  <span className="text-gray-900 font-medium">
                    {crop.field_id_c?.Name || 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Stage:</span>
                  <Badge 
                    variant="primary" 
                    className={`${getGrowthStageColor(crop.growth_stage_c)} text-white text-xs`}
                  >
                    {crop.growth_stage_c || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;