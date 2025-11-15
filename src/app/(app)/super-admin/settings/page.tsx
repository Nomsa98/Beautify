'use client'

import { useAuth } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Shield, Database, Mail, Bell, Globe, Lock, Zap } from 'lucide-react'

export default function SuperAdminSettings() {
    const { user } = useAuth({ middleware: 'auth' })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Platform Settings
                </h1>
                <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
            </div>

            {/* Coming Soon Notice */}
            <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-12">
                    <div className="text-center">
                        <div className="p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Settings className="h-10 w-10 text-pink-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings Panel Coming Soon</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Advanced platform configuration tools are being developed to give you 
                            complete control over system behavior and preferences.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Security</p>
                                <p className="text-xs text-gray-500 mt-1">Access control</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Database className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Database</p>
                                <p className="text-xs text-gray-500 mt-1">Backups & maintenance</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Mail className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Email</p>
                                <p className="text-xs text-gray-500 mt-1">SMTP configuration</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Bell className="h-6 w-6 text-pink-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Notifications</p>
                                <p className="text-xs text-gray-500 mt-1">Alert preferences</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Globe className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Localization</p>
                                <p className="text-xs text-gray-500 mt-1">Language & region</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Lock className="h-6 w-6 text-red-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Privacy</p>
                                <p className="text-xs text-gray-500 mt-1">Data policies</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Zap className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">Performance</p>
                                <p className="text-xs text-gray-500 mt-1">Optimization</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-700">General</p>
                                <p className="text-xs text-gray-500 mt-1">System settings</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
