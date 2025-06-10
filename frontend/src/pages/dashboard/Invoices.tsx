import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Filter, Receipt, ChevronDown } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { Invoice } from '../../types';

const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading] = useState(false);

  // Mock data for invoices
  const invoices: Invoice[] = [
    {
      id: '1',
      leaseId: '1',
      invoiceNumber: 'INV-2024-001',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 1428,
      vatAmount: 228,
      status: 'paid'
    },
    {
      id: '2',
      leaseId: '2',
      invoiceNumber: 'INV-2024-002',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 952,
      vatAmount: 152,
      status: 'pending'
    },
    {
      id: '3',
      leaseId: '3',
      invoiceNumber: 'INV-2024-003',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 2975,
      vatAmount: 475,
      status: 'overdue'
    }
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === invoice.status;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold mb-4 md:mb-0">
          Invoice Management
        </h1>
        
        <button className="btn-primary flex items-center">
          <Plus size={18} className="mr-2" />
          Create New Invoice
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-card p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search invoices..."
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
              className="input pl-10 appearance-none pr-8  md:w-60"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                  Amount
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
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                          <Receipt size={16} />
                        </div>
                        <span className="font-medium text-neutral-900">{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">Issued: {invoice.issueDate}</div>
                      <div className="text-neutral-500 text-sm">Due: {invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-neutral-900">{invoice.amount} EUR</div>
                      <div className="text-neutral-500 text-sm">VAT: {invoice.vatAmount} EUR</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        type={
                          invoice.status === 'paid' ? 'success' :
                          invoice.status === 'pending' ? 'warning' :
                          'error'
                        }
                        label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button className="btn-text py-1 px-2">
                          View
                        </button>
                        <button className="btn-text py-1 px-2">
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-neutral-500">
                    No invoices found matching your search criteria.
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

export default Invoices;