'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface PermissionMatrix {
  [role: string]: {
    [module: string]: {
      [action: string]: boolean
    }
  }
}

interface RoleStat {
  role: string
  userCount: number
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function PermissionsPage() {
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({})
  const [roleStats, setRoleStats] = useState<RoleStat[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>('MANAGER')
  const [showUserManager, setShowUserManager] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch permissions
      const permRes = await fetch('/api/admin/permissions')
      const permData = await permRes.json()
      
      if (permRes.ok) {
        setPermissionMatrix(permData.permissionMatrix)
        setRoleStats(permData.roleStats)
      } else {
        toast.error(permData.error || 'Failed to fetch permissions')
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users')
      const usersData = await usersRes.json()
      
      if (usersRes.ok) {
        setUsers(usersData.users || [])
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success('Role updated successfully')
        fetchData()
      } else {
        toast.error(data.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const modules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'shipments', label: 'Shipments' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'repossessions', label: 'Repossession' },
    { key: 'redeployments', label: 'Redeployment' },
    { key: 'templates', label: 'Templates' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'auditLogs', label: 'Audit Logs' },
    { key: 'reports', label: 'Reports' },
    { key: 'settings', label: 'Settings' },
    { key: 'users', label: 'User Management' }
  ]

  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export', 'resolve', 'schedule', 'manageRoles']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
        <p className="text-gray-500 mt-1">Manage roles and permissions for your team</p>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {roleStats.map((stat) => (
          <div key={stat.role} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stat.userCount}</div>
            <div className="text-sm text-gray-500">{stat.role}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setShowUserManager(false)}
              className={`px-6 py-4 text-sm font-medium ${
                !showUserManager
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Permission Matrix
            </button>
            <button
              onClick={() => setShowUserManager(true)}
              className={`px-6 py-4 text-sm font-medium ${
                showUserManager
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>

        {!showUserManager ? (
          /* Permission Matrix */
          <div className="p-6">
            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role to View
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            {/* Permission Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    {actions.map((action) => (
                      <th key={action} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {action.replace(/([A-Z])/g, ' $1').trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modules.map((module) => (
                    <tr key={module.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {module.label}
                      </td>
                      {actions.map((action) => {
                        const hasPermission = permissionMatrix[selectedRole]?.[module.key]?.[action]
                        return (
                          <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                            {hasPermission !== undefined ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                hasPermission
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {hasPermission ? '✓' : '✕'}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* User Management */
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'MANAGER'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'USER'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="USER">User</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
