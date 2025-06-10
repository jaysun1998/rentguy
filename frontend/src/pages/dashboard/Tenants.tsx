import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Users, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { Tenant } from '../../types';
import { apiService } from '../../services/api';

const Tenants: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getTenants();
        setTenants(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tenants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(tenant => {
    const fullName = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === tenant.screeningStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Tenants Management
        </h1>
        
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Add New Tenant
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tenants..."
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
              <option value="all">All Tenants</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="denied">Denied</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Nationality
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
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredTenants.length > 0 ? (
                filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                          <Users size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">
                          {tenant.firstName} {tenant.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">{tenant.email}</div>
                      <div className="text-neutral-500 text-sm">{tenant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-900">
                      {tenant.nationality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={
                          tenant.screeningStatus === 'approved' ? 'success' :
                          tenant.screeningStatus === 'pending' ? 'warning' :
                          'error'
                        }
                        label={tenant.screeningStatus.charAt(0).toUpperCase() + tenant.screeningStatus.slice(1)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="btn-text py-1 px-2">
                          View
                        </button>
                        <button className="btn-text py-1 px-2">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                    No tenants found matching your search criteria.
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

export default Tenants;