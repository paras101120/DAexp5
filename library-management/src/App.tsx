import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import Students from './components/Students';
import Allotment from './components/Allotment';
import Returns from './components/Returns';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'books':
        return <Books />;
      case 'students':
        return <Students />;
      case 'allotment':
        return <Allotment />;
      case 'returns':
        return <Returns />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
