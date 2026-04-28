import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function MlDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)
  const [modelInfo, setModelInfo] = useState(null)
  const [datasetInfo, setDatasetInfo] = useState(null)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statusRes, sizeRes] = await Promise.all([
        api.get('/ml/status'),
        api.get('/ml/dataset/size')
      ])
      setModelInfo(statusRes.data)
      setDatasetInfo(sizeRes.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch ML dashboard data. Is the service running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRetrain = async () => {
    try {
      setRetraining(true)
      setError(null)
      await api.post('/ml/train')
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to trigger retraining.')
    } finally {
      setRetraining(false)
    }
  }

  if (loading && !modelInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    )
  }

  const { cd_model, cl_model, model_version, training_date, dataset_size: trainedSize } = modelInfo || {}
  const { size: currentSize, retrain_threshold } = datasetInfo || {}

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    return new Date(isoString).toLocaleString()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ML Dashboard</h1>
          <p className="text-gray-500 mt-1">Monitor and manage the CFD Machine Learning models</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            v{model_version || '1.0'}
          </span>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              retraining ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {retraining ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Retraining...
              </span>
            ) : (
              'Retrain Now'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Model Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Model Performance
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Cd Model R²</span>
                <span className="font-bold text-gray-900">{cd_model?.r2 ? cd_model.r2.toFixed(4) : 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${cd_model?.r2 > 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.max(0, Math.min(100, (cd_model?.r2 || 0) * 100))}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Cl Model R²</span>
                <span className="font-bold text-gray-900">{cl_model?.r2 ? cl_model.r2.toFixed(4) : 'N/A'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${cl_model?.r2 > 0.9 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${Math.max(0, Math.min(100, (cl_model?.r2 || 0) * 100))}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold">Cd MAE</div>
                <div className="text-lg font-bold text-gray-900">{cd_model?.mae ? cd_model.mae.toFixed(4) : 'N/A'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase font-semibold">Cl MAE</div>
                <div className="text-lg font-bold text-gray-900">{cl_model?.mae ? cl_model.mae.toFixed(4) : 'N/A'}</div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mt-2">
              Last Training Date: {formatDate(training_date)}
            </div>
          </div>
        </div>

        {/* Dataset Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            Dataset Status
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-700 font-medium">Total Validated Simulations</span>
              <span className="text-xl font-bold text-gray-900">{currentSize !== undefined ? currentSize : 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-gray-700 font-medium">Samples Used in Last Training</span>
              <span className="text-xl font-bold text-gray-900">{trainedSize !== undefined ? trainedSize : 'N/A'}</span>
            </div>

            {currentSize !== undefined && trainedSize !== undefined && retrain_threshold && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Samples Until Next Retraining</span>
                  <span className="text-gray-500">{currentSize - trainedSize} / {retrain_threshold}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ((currentSize - trainedSize) / retrain_threshold) * 100))}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
