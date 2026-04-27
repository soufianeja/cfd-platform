import { useState } from 'react'
import api from '../../api/axios'

const GEOMETRY_TYPES = [
  { id: 'airfoil', name: 'Airfoil / Wing' },
  { id: 'fsae', name: 'FSAE Race Car' },
  { id: 'sedan', name: 'Sedan' },
  { id: 'suv', name: 'SUV' },
  { id: 'truck', name: 'Truck' },
  { id: 'sphere', name: 'Sphere' },
  { id: 'cylinder', name: 'Cylinder' },
  { id: 'flat_plate', name: 'Flat Plate' },
  { id: 'ahmed_body', name: 'Ahmed Body' },
  { id: 'wedge', name: 'Wedge' },
]

export default function PredictPage() {
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    geometry_type: 'sedan',
    surface_area: 0,
    volume: 0,
    length: 0,
    width: 0,
    height: 0,
    frontal_area: 0,
    velocity: 30,
    reynolds: 1000000,
    rear_wing_angle: 0,
    slant_angle: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'geometry_type' ? value : parseFloat(value) || 0
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setExtracting(true)
    setError(null)
    
    const uploadData = new FormData()
    uploadData.append('file', file)

    try {
      const response = await api.post('/ml/extract', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setFormData(prev => ({
        ...prev,
        ...response.data
      }))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to extract features from file')
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.post('/ml/predict', formData)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Is the ML service running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          AI Aerodynamics Predictor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get instant estimates for Drag (Cd) and Lift (Cl) coefficients using our trained Random Forest models.
          Upload an STL file to automatically extract geometry features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Geometry Type */}
                <div className="col-span-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Geometry Type</label>
                  <select
                    name="geometry_type"
                    value={formData.geometry_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                  >
                    {GEOMETRY_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                {/* STL Upload */}
                <div className="col-span-full">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Auto-fill from 3D Model (.stl, .obj)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".stl,.obj"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`
                      w-full px-4 py-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center
                      ${extracting ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50/30'}
                    `}>
                      {extracting ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-blue-600 font-medium">Extracting features...</span>
                        </div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-gray-500 text-sm group-hover:text-blue-600">Click or drag file to extract features</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <h3 className="col-span-full text-sm font-bold text-gray-400 uppercase tracking-wider mt-4">Geometric Features</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Surface Area (m²)</label>
                  <input type="number" step="any" name="surface_area" value={formData.surface_area} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Volume (m³)</label>
                  <input type="number" step="any" name="volume" value={formData.volume} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Length (m)</label>
                  <input type="number" step="any" name="length" value={formData.length} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Width (m)</label>
                  <input type="number" step="any" name="width" value={formData.width} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Height (m)</label>
                  <input type="number" step="any" name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Frontal Area (m²)</label>
                  <input type="number" step="any" name="frontal_area" value={formData.frontal_area} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>

                {/* Simulation Params */}
                <h3 className="col-span-full text-sm font-bold text-gray-400 uppercase tracking-wider mt-4">Simulation Parameters</h3>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Velocity (m/s)</label>
                  <input type="number" step="any" name="velocity" value={formData.velocity} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Reynolds Number</label>
                  <input type="number" step="any" name="reynolds" value={formData.reynolds} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>

                {/* Geometry Specific */}
                {formData.geometry_type === 'fsae' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Rear Wing Angle (deg)</label>
                    <input type="number" step="any" name="rear_wing_angle" value={formData.rear_wing_angle} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 bg-blue-50/30" />
                  </div>
                )}
                {formData.geometry_type === 'ahmed_body' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Slant Angle (deg)</label>
                    <input type="number" step="any" name="slant_angle" value={formData.slant_angle} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 bg-blue-50/30" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-8 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Random Forest Regressor v2.0
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`
                  px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95
                  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 hover:shadow-blue-300'}
                `}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Predicting...</span>
                  </div>
                ) : 'Predict Coefficients'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Prediction Results
            </h2>

            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                   </div>
                   <div className="relative z-10">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Drag Coefficient</span>
                    <div className="text-4xl font-black text-blue-900 mt-1">Cd {result.drag_coefficient.toFixed(4)}</div>
                   </div>
                </div>

                <div className={`p-4 rounded-2xl border relative overflow-hidden group ${result.lift_coefficient < 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" transform="rotate(180 12 12)"/></svg>
                   </div>
                   <div className="relative z-10">
                    <span className={`text-xs font-bold uppercase tracking-widest ${result.lift_coefficient < 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {result.lift_coefficient < 0 ? 'Downforce (Lift)' : 'Lift Coefficient'}
                    </span>
                    <div className={`text-4xl font-black mt-1 ${result.lift_coefficient < 0 ? 'text-emerald-900' : 'text-orange-900'}`}>
                      Cl {result.lift_coefficient.toFixed(4)}
                    </div>
                   </div>
                </div>

                <div className="text-sm text-gray-500 italic text-center px-4">
                   * Values estimated based on geometric features. Accuracy depends on the model's training range.
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex flex-col items-center text-center gap-3">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm">Enter parameters or upload a model to see AI predictions</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-xl p-8 text-white">
            <h3 className="font-bold text-lg mb-4">How it works</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">1</span>
                Random Forest algorithms analyze the bounding box and surface features.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">2</span>
                Simulation parameters (Velocity, Re) scale the coefficients based on fluid dynamics principles.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 font-bold text-xs">3</span>
                Instant inference: ~50ms vs hours for standard CFD.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
