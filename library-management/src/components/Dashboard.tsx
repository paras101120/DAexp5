import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BookOpen, Users, BookCheck, RotateCcw, TrendingUp } from 'lucide-react';
import { dashboardService } from '../services/firestore';
import { DashboardStats } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalBorrowed: 0,
    totalReturned: 0,
    totalStudents: 0,
    activeStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const doughnutData = {
    labels: ['Available Books', 'Borrowed Books'],
    datasets: [
      {
        data: [stats.totalBooks - stats.totalBorrowed, stats.totalBorrowed],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: ['Total Books', 'Borrowed', 'Returned', 'Students', 'Active Students'],
    datasets: [
      {
        label: 'Count',
        data: [stats.totalBooks, stats.totalBorrowed, stats.totalReturned, stats.totalStudents, stats.activeStudents],
        backgroundColor: [
          '#3B82F6',
          '#F59E0B',
          '#10B981',
          '#8B5CF6',
          '#EF4444'
        ],
        borderColor: [
          '#2563EB',
          '#D97706',
          '#059669',
          '#7C3AED',
          '#DC2626'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalBooks}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-blue-600">Available: {stats.totalBooks - stats.totalBorrowed}</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookCheck className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Currently Borrowed</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalBorrowed}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-yellow-600">Active loans</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RotateCcw className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Books Returned</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalReturned}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-green-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-green-600">Total returns</span>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-lg rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                  <dd className="text-3xl font-bold text-gray-900">{stats.totalStudents}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 px-5 py-3">
            <div className="text-sm">
              <span className="font-medium text-purple-600">Active: {stats.activeStudents}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Book Availability</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Library Statistics</h3>
          </div>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{((stats.totalBooks - stats.totalBorrowed) / stats.totalBooks * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Books Available</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{(stats.totalBorrowed / stats.totalBooks * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Books Borrowed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents * 100).toFixed(1) : 0}%</div>
            <div className="text-sm text-gray-600">Active Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}