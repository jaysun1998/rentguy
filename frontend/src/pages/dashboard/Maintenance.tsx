import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Wrench, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { MaintenanceRequest } from '../../types';

const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading] = useState(false);

  // Mock data for maintenance requests
  const requests: MaintenanceRequest[] = [
    {
      id: '1',
      unitId: '1',
      tenantId: '1',
      category: 'Plumbing',
      description: 'Leaking faucet in kitchen',
      reportedAt: '2024-01-15T10:30:00Z',
      status: 'open'
    },
    {
      id: '2',
      unitId: '2',
      tenantId: '2',
      category: 'Electrical',
      description: 'Power outlet not working in living room',
      reportedAt: '2024-01-14T15:45:00Z',
      status: 'in_progress'
    },
    {
      id: '3',
      unitId: '3',
      tenantId: '3',
      category: 'HVAC',
      description: 'Heating system not working properly',
      reportedAt: '2024-01-13T09:15:00Z',
      status: 'resolved'
    }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === request.status;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Maintenance Requests
        </h1>
        
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Create New Request
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input pl-10 appearance-none pr-8 md:w-60"
            >
              <option value="all">All Requests</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Requests Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Reported
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-8 bg-neutral-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <tr key={request.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                          <Wrench size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">#{request.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-900">{request.category}</div>
                      <div className="text-neutral-500 text-sm truncate max-w-xs">
                        {request.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">
                        {new Date(request.reportedAt).toLocaleDateString()}
                      </div>
                      <div className="text-neutral-500 text-sm">
                        {new Date(request.reportedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={
                          request.status === 'resolved' ? 'success' :
                          request.status === 'in_progress' ? 'warning' :
                          request.status === 'open' ? 'error' :
                          'neutral'
                        }
                        label={request.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="btn-text py-1 px-2">
                          View
                        </button>
                        <button className="btn-text py-1 px-2">
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                    No maintenance requests found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;