'use client'

import { useAuth } from '@/hooks/auth'

export default function Notifications() {
  const { user } = useAuth({ middleware: 'auth' })

  const canSend = user?.permissions?.includes('send notifications')
  const canManagePromotions = user?.permissions?.includes('manage promotions')
  const canViewFeedback = user?.permissions?.includes('view feedback')

  return (
    
      <div className="bg-white overflow-hidden shadow-sm rounded-lg">
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Communication Center
            </h3>
            <div className="flex gap-2">
              {canSend && (
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Send Notification
                </button>
              )}
              {canManagePromotions && (
                <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                  Create Promotion
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Manage client communications and promotions
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Sent Today</h4>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Active Promotions</h4>
              <p className="text-2xl font-bold text-green-600">3</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Pending Reviews</h4>
              <p className="text-2xl font-bold text-yellow-600">7</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-2">Your Permissions:</h4>
            <div className="flex flex-wrap gap-2">
              {canSend && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Send</span>}
              {canManagePromotions && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">Promotions</span>}
              {canViewFeedback && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Feedback</span>}
            </div>
          </div>
        </div>
      </div>
    
  )
}
