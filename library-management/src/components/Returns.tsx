import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Calendar, AlertCircle, Check, Clock } from 'lucide-react';
import { borrowRecordsService } from '../services/firestore';
import { BorrowRecord } from '../types';

export default function Returns() {
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'borrowed' | 'overdue'>('borrowed');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBorrowRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [borrowRecords, searchTerm, filterStatus]);

  async function loadBorrowRecords() {
    try {
      setLoading(true);
      const records = await borrowRecordsService.getAll();
      setBorrowRecords(records);
    } catch (error) {
      console.error('Error loading borrow records:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterRecords() {
    let filtered = borrowRecords;

    // Filter by status
    if (filterStatus === 'borrowed') {
      filtered = filtered.filter(record => !record.isReturned);
    } else if (filterStatus === 'overdue') {
      const today = new Date();
      filtered = filtered.filter(record => 
        !record.isReturned && new Date(record.dueDate) < today
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentRollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  }

  async function handleReturn(recordId: string) {
    if (window.confirm('Are you sure you want to mark this book as returned?')) {
      try {
        await borrowRecordsService.returnBook(recordId);
        setMessage({ 
          type: 'success', 
          text: 'Book has been successfully returned and availability updated.' 
        });
        loadBorrowRecords();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error returning book. Please try again.' });
        console.error('Error returning book:', error);
      }
    }
  }

  function isOverdue(dueDate: Date): boolean {
    return new Date() > new Date(dueDate);
  }

  function getDaysOverdue(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message) {
        setMessage(null);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  const borrowedCount = borrowRecords.filter(record => !record.isReturned).length;
  const overdueCount = borrowRecords.filter(record => 
    !record.isReturned && isOverdue(record.dueDate)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Return Books</h1>
        <button
          onClick={loadBorrowRecords}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        } flex items-center`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Borrowed</div>
              <div className="text-2xl font-bold text-gray-900">{borrowedCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Overdue</div>
              <div className="text-2xl font-bold text-gray-900">{overdueCount}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Returned Today</div>
              <div className="text-2xl font-bold text-gray-900">
                {borrowRecords.filter(record => 
                  record.isReturned && 
                  record.returnDate && 
                  new Date(record.returnDate).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Records</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by book title, author, student name, or roll number..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'borrowed' | 'overdue')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Records</option>
              <option value="borrowed">Currently Borrowed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus === 'borrowed' 
                ? 'No books are currently borrowed.' 
                : filterStatus === 'overdue'
                ? 'No overdue books found.'
                : 'No borrow records match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book & Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{record.bookTitle}</div>
                        <div className="text-sm text-gray-500">by {record.bookAuthor}</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{record.studentName}</span> 
                          <span className="text-gray-400"> (Roll: {record.studentRollNumber})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Borrowed: {record.borrowDate.toLocaleDateString()}</div>
                        <div>Due: {record.dueDate.toLocaleDateString()}</div>
                        {record.isReturned && record.returnDate && (
                          <div className="text-green-600">
                            Returned: {record.returnDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.isReturned ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Returned
                        </span>
                      ) : isOverdue(record.dueDate) ? (
                        <div className="space-y-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </span>
                          <div className="text-xs text-red-600">
                            {getDaysOverdue(record.dueDate)} days late
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Borrowed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {!record.isReturned && (
                        <button
                          onClick={() => handleReturn(record.id!)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark as Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">Return Process:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Use the filters to find specific borrowed books</li>
          <li>• Check for overdue books that need immediate attention</li>
          <li>• Click "Mark as Returned" to process a book return</li>
          <li>• The book's available quantity will be automatically increased</li>
          <li>• Return date will be recorded in the system</li>
        </ul>
      </div>
    </div>
  );
}