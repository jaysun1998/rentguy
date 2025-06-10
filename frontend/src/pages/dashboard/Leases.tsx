import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, FileText, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { Lease } from '../../types';

const Leases: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading] = useState(false);

  // Mock data for leases
  const leases: Lease[] = [
    {
      id: '1',
      unitId: '1',
      tenantId: '1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      rent: 1200,
      currency: 'EUR',
      securityDeposit: 2400,
      depositCurrency: 'EUR',
      vatRate: 19,
      status: 'active'
    },
    {
      id: '2',
      unitId: '2',
      tenantId: '2',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      rent: 800,
      currency: 'EUR',
      securityDeposit: 1600,
      depositCurrency: 'EUR',
      vatRate: 19,
      status: 'pending_signature'
    },
    {
      id: '3',
      unitId: '3',
      tenantId: '3',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      rent: 2500,
      currency: 'EUR',
      securityDeposit: 5000,
      depositCurrency: 'EUR',
      vatRate: 19,
      status: 'expired'
    }
  ];

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === lease.status;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Lease Management
        </h1>
        
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Create New Lease
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search leases..."
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
              <option value="all">All Leases</option>
              <option value="active">Active</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Lease ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Rent
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
                      <div className="h-4 bg-neutral-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-neutral-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-8 bg-neutral-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))
              ) : filteredLeases.length > 0 ? (
                filteredLeases.map(lease => (
                  <tr key={lease.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">#{lease.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">{lease.startDate}</div>
                      <div className="text-neutral-500 text-sm">to {lease.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">
                        {lease.rent} {lease.currency}
                      </div>
                      <div className="text-neutral-500 text-sm">
                        VAT: {lease.vatRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={
                          lease.status === 'active' ? 'success' :
                          lease.status === 'pending_signature' ? 'warning' :
                          'error'
                        }
                        label={lease.status.split('_').map(word => 
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
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                    No leases found matching your search criteria.
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

export default Leases;