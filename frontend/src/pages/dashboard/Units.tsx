import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Home, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { Unit } from '../../types';

const Units: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading] = useState(false);

  // Mock data for units
  const units: Unit[] = [
    {
      id: '1',
      propertyId: '1',
      unitNumber: '101',
      floor: 1,
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 75,
      rent: 1200,
      currency: 'EUR',
      depositAmount: 2400,
      status: 'occupied'
    },
    {
      id: '2',
      propertyId: '1',
      unitNumber: '102',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 45,
      rent: 800,
      currency: 'EUR',
      depositAmount: 1600,
      status: 'vacant'
    },
    {
      id: '3',
      propertyId: '2',
      unitNumber: '201',
      floor: 2,
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      rent: 2500,
      currency: 'EUR',
      depositAmount: 5000,
      status: 'occupied'
    }
  ];

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === unit.status;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Units Management
        </h1>
        
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Add New Unit
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search units..."
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
              <option value="all">All Units</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Details
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
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map(unit => (
                  <tr key={unit.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                          <Home size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">Unit {unit.unitNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">
                        {unit.bedrooms} bed, {unit.bathrooms} bath
                      </div>
                      <div className="text-neutral-500 text-sm">
                        {unit.squareMeters} m²
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">
                        {unit.rent} {unit.currency}
                      </div>
                      <div className="text-neutral-500 text-sm">
                        Deposit: {unit.depositAmount} {unit.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={unit.status === 'vacant' ? 'warning' : 'success'}
                        label={unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
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
                    No units found matching your search criteria.
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

export default Units;