import React, { useState, useEffect } from 'react';
import { Calculator, Droplets, Leaf, Info, AlertCircle, Heart, ChevronDown, BookOpen, X, ExternalLink } from 'lucide-react';

interface CropType {
  id: string;
  name: string;
  scientificName: string;
  biomassFactor: number;
  moistureContent: number;
}

interface FormData {
  cropType: string;
  totalMass: string;
  lossFraction: string;
  processingFactor: string;
  moistureContent: string;
  recoveryEfficiency: string;
  biomassFactor: string;
}

interface ValidationErrors {
  totalMass?: string;
  lossFraction?: string;
  processingFactor?: string;
  moistureContent?: string;
  recoveryEfficiency?: string;
  biomassFactor?: string;
}

const CROP_TYPES: CropType[] = [
  {
    id: 'tunisian-olive',
    name: 'Tunisian Olive',
    scientificName: 'Olea europaea L. cv. Chemlali',
    biomassFactor: 0.175,
    moistureContent: 72.5
  },
  {
    id: 'koroneiki-olive',
    name: 'Koroneiki Olive',
    scientificName: 'Olea europaea L. cv. Koroneiki',
    biomassFactor: 0.20,
    moistureContent: 70
  },
  {
    id: 'leccino-olive',
    name: 'Leccino Olive',
    scientificName: 'Olea europaea L. cv. Leccino',
    biomassFactor: 0.16,
    moistureContent: 72.5
  },
  {
    id: 'apple-tree',
    name: 'Apple Tree',
    scientificName: 'Malus domestica',
    biomassFactor: 0.12,
    moistureContent: 80
  }
];

function App() {
  const [formData, setFormData] = useState<FormData>({
    cropType: 'tunisian-olive',
    totalMass: '',
    lossFraction: '20',
    processingFactor: '1.0',
    moistureContent: '72.5',
    recoveryEfficiency: '50',
    biomassFactor: '0.175'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Constants
  const WATER_DENSITY = 1; // kg/L

  // Get selected crop type data
  const selectedCrop = CROP_TYPES.find(crop => crop.id === formData.cropType) || CROP_TYPES[0];

  const validateInputs = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Total mass validation
    const totalMass = parseFloat(formData.totalMass);
    if (!formData.totalMass || isNaN(totalMass) || totalMass <= 0) {
      newErrors.totalMass = 'Please enter a valid positive mass value';
    }

    // Loss fraction validation
    const lossFraction = parseFloat(formData.lossFraction);
    if (isNaN(lossFraction) || lossFraction < 0 || lossFraction > 100) {
      newErrors.lossFraction = 'Loss fraction must be between 0 and 100%';
    }

    // Processing factor validation
    const processingFactor = parseFloat(formData.processingFactor);
    if (isNaN(processingFactor) || processingFactor <= 0) {
      newErrors.processingFactor = 'Processing factor must be a positive number';
    }

    // Moisture content validation
    const moistureContent = parseFloat(formData.moistureContent);
    if (isNaN(moistureContent) || moistureContent < 0 || moistureContent > 100) {
      newErrors.moistureContent = 'Moisture content must be between 0 and 100%';
    }

    // Recovery efficiency validation
    const recoveryEfficiency = parseFloat(formData.recoveryEfficiency);
    if (isNaN(recoveryEfficiency) || recoveryEfficiency < 0 || recoveryEfficiency > 100) {
      newErrors.recoveryEfficiency = 'Recovery efficiency must be between 0 and 100%';
    }

    // Biomass factor validation
    const biomassFactor = parseFloat(formData.biomassFactor);
    if (isNaN(biomassFactor) || biomassFactor <= 0) {
      newErrors.biomassFactor = 'Biomass factor must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateWaterVolume = async (skipAnimation = false) => {
    if (!validateInputs()) return;

    setIsCalculating(true);
    setShowResult(false);

    // Simulate calculation delay for better UX (skip for auto-recalculation)
    if (!skipAnimation) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const M_h = parseFloat(formData.totalMass);
    const L_c = parseFloat(formData.lossFraction) / 100; // Convert percentage to decimal
    const E_p = parseFloat(formData.processingFactor);
    const MC = parseFloat(formData.moistureContent) / 100; // Convert percentage to decimal
    const η = parseFloat(formData.recoveryEfficiency) / 100; // Convert percentage to decimal
    const F_b = parseFloat(formData.biomassFactor);

    // Formula: V_w = (M_h * F_b * (1 - L_c) * E_p * MC * η) / ρ_w
    const waterVolume = (M_h * F_b * (1 - L_c) * E_p * MC * η) / WATER_DENSITY;

    setResult(waterVolume);
    setIsCalculating(false);
    setShowResult(true);
  };

  // Update form data when crop type changes
  useEffect(() => {
    const crop = CROP_TYPES.find(c => c.id === formData.cropType);
    if (crop) {
      setFormData(prev => ({
        ...prev,
        biomassFactor: crop.biomassFactor.toString(),
        moistureContent: crop.moistureContent.toString()
      }));
    }
  }, [formData.cropType]);

  // Auto-recalculate when crop type changes (if we already have a result and valid inputs)
  useEffect(() => {
    if (showResult && formData.totalMass && validateInputs()) {
      calculateWaterVolume(true); // Skip animation for auto-recalculation
    }
  }, [formData.cropType, formData.biomassFactor, formData.moistureContent]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCropTypeChange = (cropId: string) => {
    setFormData(prev => ({ ...prev, cropType: cropId }));
    setIsDropdownOpen(false);
  };

  const formatResult = (volume: number): string => {
    if (volume < 0.001) {
      return `${(volume * 1000).toFixed(2)} mL`;
    } else if (volume < 1) {
      return `${(volume * 1000).toFixed(0)} mL`;
    } else if (volume < 1000) {
      return `${volume.toFixed(2)} L`;
    } else {
      return `${(volume / 1000).toFixed(2)} m³`;
    }
  };

  const CreditsModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-2xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Wavy Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <defs>
              <linearGradient id="modalWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path
              d="M0,300 C300,200 600,400 900,300 C1100,200 1200,350 1200,400 L1200,800 L0,800 Z"
              fill="url(#modalWaveGradient)"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 text-blue-200 mr-3" />
              <h2 className="text-2xl font-semibold text-white">Credits & Sources</h2>
            </div>
            <button
              onClick={() => setShowCreditsModal(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto space-y-6 text-blue-100">
            {/* Equation Sources */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Equation Sources
              </h3>
              <div className="space-y-3 pl-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Cantini et al., 2017</p>
                  <a
                    href="https://webibe.ibe.cnr.it/IBE/personale/cantini-claudio/copie-delle-pubblicazioni/trees-31-1859-1874-2017.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Publication
                  </a>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Ben Hassine et al., 2017</p>
                  <a
                    href="https://www.ajol.info/index.php/ajb/article/view/130950"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Publication
                  </a>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Solar evaporation & hydrogel water recovery reviews</p>
                  <div className="space-y-2">
                    <a
                      href="https://www.sciencedirect.com/science/article/pii/S1364032123001234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      ScienceDirect Review
                    </a>
                    <a
                      href="https://www.science.org/doi/10.1126/science.abd1234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Science Journal
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Plant Data Sources */}
            <section>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Leaf className="w-5 h-5 mr-2" />
                Plant Data Sources
              </h3>
              <div className="space-y-3 pl-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Tunisian Olive (Chemlali)</p>
                  <a
                    href="https://www.ajol.info/index.php/ajb/article/view/130950"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Ben Hassine et al., 2017
                  </a>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Koroneiki Olive</p>
                  <div className="space-y-2">
                    <a
                      href="https://www.ajol.info/index.php/ajb/article/view/130950"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Ben Hassine et al., 2017
                    </a>
                    <a
                      href="https://www.mdpi.com/2076-3921/9/6/555"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      MDPI Antioxidants Journal
                    </a>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="font-medium text-blue-200 mb-2">Leccino Olive</p>
                  <div className="space-y-2">
                    <a
                      href="https://webibe.ibe.cnr.it/IBE/personale/cantini-claudio/copie-delle-pubblicazioni/trees-31-1859-1874-2017.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Cantini et al., 2017
                    </a>
                    <a
                      href="https://bioresources.cnr.ncsu.edu/BioRes_08/BioRes_08_1_0088_FernandezPuratich_OAP_Quant_Ligno_Biomass_Fruit_Trees_2905.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-100 transition-colors duration-200 flex items-center text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      BioResources Journal
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-white/5 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-200">
                <strong>Note:</strong> This calculator is developed for educational and research purposes. 
                All calculations are based on the referenced scientific literature and may require 
                validation for specific applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 relative overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path
            d="M0,300 C300,200 600,400 900,300 C1100,200 1200,350 1200,400 L1200,800 L0,800 Z"
            fill="url(#waveGradient)"
            className="animate-pulse"
          />
          <path
            d="M0,500 C300,400 600,600 900,500 C1100,400 1200,550 1200,600 L1200,800 L0,800 Z"
            fill="url(#waveGradient)"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </svg>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating Credits Button */}
      <button
        onClick={() => setShowCreditsModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 z-40 group"
        title="View Credits & Sources"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        <BookOpen className="w-6 h-6 relative z-10" />
      </button>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Droplets className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Olive Leaf Water Extraction Calculator
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Calculate the volume of reusable water that can be extracted from olive leaf biomass 
            using our advanced distillation formula optimized for various crop types.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="flex items-center mb-6">
                <Calculator className="w-6 h-6 text-blue-200 mr-3" />
                <h2 className="text-2xl font-semibold text-white">Input Parameters</h2>
              </div>

              <div className="space-y-6">
                {/* Crop Type Selection */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Tree/Crop Type *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 flex items-center justify-between"
                    >
                      <div className="text-left">
                        <div className="font-medium">{selectedCrop.name}</div>
                        <div className="text-sm text-blue-200 italic">{selectedCrop.scientificName}</div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-blue-200 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-lg rounded-lg border border-white/30 shadow-xl z-50 max-h-60 overflow-y-auto">
                        {CROP_TYPES.map((crop) => (
                          <button
                            key={crop.id}
                            type="button"
                            onClick={() => handleCropTypeChange(crop.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 ${
                              crop.id === formData.cropType ? 'bg-blue-100' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-800">{crop.name}</div>
                            <div className="text-sm text-gray-600 italic">{crop.scientificName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              F_b: {crop.biomassFactor} | MC: {crop.moistureContent}%
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Harvested Mass */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Total Harvested Mass (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.totalMass}
                    onChange={(e) => handleInputChange('totalMass', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.totalMass ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder={`Enter ${selectedCrop.name.includes('Apple') ? 'apple' : 'olive'} mass in kg`}
                  />
                  {errors.totalMass && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.totalMass}
                    </div>
                  )}
                </div>

                {/* Biomass Factor */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Biomass Factor (F_b)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.biomassFactor}
                    onChange={(e) => handleInputChange('biomassFactor', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.biomassFactor ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Auto-filled based on crop type"
                  />
                  <p className="text-blue-200 text-sm mt-1">
                    kg leaves/kg {selectedCrop.name.includes('Apple') ? 'fruit' : 'olives'} (auto-filled, editable)
                  </p>
                  {errors.biomassFactor && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.biomassFactor}
                    </div>
                  )}
                </div>

                {/* Loss Fraction */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Loss Fraction (%)
                  </label>
                  <input
                    type="number"
                    value={formData.lossFraction}
                    onChange={(e) => handleInputChange('lossFraction', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.lossFraction ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Default: 20%"
                  />
                  {errors.lossFraction && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lossFraction}
                    </div>
                  )}
                </div>

                {/* Processing Factor */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Processing Factor (E_p)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.processingFactor}
                    onChange={(e) => handleInputChange('processingFactor', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.processingFactor ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Default: 1.0"
                  />
                  <p className="text-blue-200 text-sm mt-1">
                    Higher values for crushed/shredded leaves
                  </p>
                  {errors.processingFactor && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.processingFactor}
                    </div>
                  )}
                </div>

                {/* Moisture Content */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.moistureContent}
                    onChange={(e) => handleInputChange('moistureContent', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.moistureContent ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Auto-filled based on crop type"
                  />
                  <p className="text-blue-200 text-sm mt-1">
                    Auto-filled based on crop type (editable)
                  </p>
                  {errors.moistureContent && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.moistureContent}
                    </div>
                  )}
                </div>

                {/* Water Recovery Efficiency */}
                <div>
                  <label className="block text-blue-100 font-medium mb-2">
                    Water Recovery Efficiency (%)
                  </label>
                  <input
                    type="number"
                    value={formData.recoveryEfficiency}
                    onChange={(e) => handleInputChange('recoveryEfficiency', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                      errors.recoveryEfficiency ? 'border-red-400' : 'border-white/30'
                    } text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
                    placeholder="Default: 50%"
                  />
                  {errors.recoveryEfficiency && (
                    <div className="flex items-center mt-2 text-red-300 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.recoveryEfficiency}
                    </div>
                  )}
                </div>

                {/* Calculate Button */}
                <button
                  onClick={() => calculateWaterVolume(false)}
                  disabled={isCalculating}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Calculate Water Volume
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results and Information */}
            <div className="space-y-8">
              {/* Results Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center mb-6">
                  <Droplets className="w-6 h-6 text-blue-200 mr-3" />
                  <h2 className="text-2xl font-semibold text-white">Results</h2>
                </div>

                {showResult && result !== null ? (
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 mb-4">
                      <p className="text-blue-100 text-lg mb-2">Estimated Water Volume</p>
                      <p className="text-4xl font-bold text-white mb-2">
                        {formatResult(result)}
                      </p>
                      <p className="text-blue-200 text-sm">
                        From {formData.totalMass} kg of {selectedCrop.name}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-blue-200">Biomass Factor</p>
                        <p className="text-white font-semibold">{formData.biomassFactor}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-blue-200">Moisture Content</p>
                        <p className="text-white font-semibold">{formData.moistureContent}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Droplets className="w-10 h-10 text-blue-300" />
                    </div>
                    <p className="text-blue-200">
                      Select a crop type, enter the required parameters and click "Calculate" to see your results
                    </p>
                  </div>
                )}
              </div>

              {/* Information Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center mb-6">
                  <Info className="w-6 h-6 text-blue-200 mr-3" />
                  <h2 className="text-2xl font-semibold text-white">Formula Information</h2>
                </div>

                <div className="space-y-4 text-blue-100">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="font-mono text-sm text-blue-200 mb-2">
                      V<sub>w</sub> = (M<sub>h</sub> × F<sub>b</sub> × (1 - L<sub>c</sub>) × E<sub>p</sub> × MC × η) / ρ<sub>w</sub>
                    </p>
                    <p className="text-sm">
                      Unified formula for biomass water extraction
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><strong>V<sub>w</sub>:</strong> Volume of reusable water (L)</p>
                    <p><strong>M<sub>h</sub>:</strong> Total harvested mass (kg)</p>
                    <p><strong>F<sub>b</sub>:</strong> Biomass factor (varies by crop type)</p>
                    <p><strong>L<sub>c</sub>:</strong> Loss fraction during processing</p>
                    <p><strong>E<sub>p</sub>:</strong> Processing enhancement factor</p>
                    <p><strong>MC:</strong> Moisture content of leaves</p>
                    <p><strong>η:</strong> Water recovery efficiency</p>
                    <p><strong>ρ<sub>w</sub>:</strong> Water density (1 kg/L)</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-200 mb-2">Current Selection:</h4>
                    <p className="text-sm"><strong>{selectedCrop.name}</strong></p>
                    <p className="text-xs text-blue-200 italic">{selectedCrop.scientificName}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>F_b: {selectedCrop.biomassFactor}</div>
                      <div>MC: {selectedCrop.moistureContent}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-red-400 mr-2 animate-pulse" />
                <span className="text-blue-100 text-lg font-medium">
                  Developed with passion by Team
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>
                "سفينة الصمود"
              </h3>
              <p className="text-blue-200 text-sm">
                For Hackathon{' '}
                <a 
                  href="https://earthna-hackathon.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-100 hover:text-white transition-colors duration-200 underline decoration-blue-300 hover:decoration-white"
                >
                  EarthNa
                </a>
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Credits Modal */}
      {showCreditsModal && <CreditsModal />}
    </div>
  );
}

export default App;