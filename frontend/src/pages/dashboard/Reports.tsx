import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Download, Filter, ChevronDown } from 'lucide-react';
import MetricCard from '../../components/ui/MetricCard';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading] = useState(false);

  const metrics = [
    {
      title: 'Total Revenue',
      value: '€45,280',
      icon: <BarChart3 size={24} />,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: 'Average Occupancy',
      value: '92%',
      icon: <BarChart3 size={24} />,
      trend: { value: 3.2, isPositive: true }
    },
    {
      title: 'Maintenance Costs',
      value: '€5,840',
      icon: <BarChart3 size={24} />,
      trend: { value: 8.1, isPositive: false }
    },
    {
      title: 'Net Operating Income',
      value: '€38,450',
      icon: <BarChart3 size={24} />,
      trend: { value: 15.3, isPositive: true }
    }
  ];

  const reports = [
    {
      name: 'Financial Statement',
      description: 'Monthly financial overview including revenue, expenses, and profit',
      type: 'PDF',
      size: '2.4 MB',
      date: '2024-01-31'
    },
    {
      name: 'Occupancy Report',
      description: 'Detailed analysis of property occupancy rates and trends',
      type: 'Excel',
      size: '1.8 MB',
      date: '2024-01-31'
    },
    {
      name: 'Maintenance Summary',
      description: 'Summary of maintenance requests and associated costs',
      type: 'PDF',
      size: '1.2 MB',
      date: '2024-01-31'
    },
    {
      name: 'Tenant Activity',
      description: 'Overview of tenant movements, lease renewals, and issues',
      type: 'PDF',
      size: '3.1 MB',
      date: '2024-01-31'
    }
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Reports & Analytics
        </h1>
        
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input pl-10 appearance-none pr-8 md:w-40"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown size={16} className="text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Available Reports</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {reports.map((report, index) => (
            <div key={index} className="p-6 flex items-center justify-between hover:bg-neutral-50">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-neutral-900 mb-1">{report.name}</h3>
                <p className="text-neutral-600 text-sm mb-2">{report.description}</p>
                <div className="flex items-center text-sm text-neutral-500">
                  <span className="mr-4">Type: {report.type}</span>
                  <span className="mr-4">Size: {report.size}</span>
                  <span>Generated: {report.date}</span>
                </div>
              </div>
              <button className="btn-secondary flex items-center ml-4">
                <Download size={18} className="mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;