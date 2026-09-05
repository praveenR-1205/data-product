import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { E2ETestingPage } from '../components/ingestion/E2ETestingPage';
import { TestRunDetails } from '../components/ingestion/TestRunDetails';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Navigate to="/test-runs" replace />} />
        <Route path="test-runs" element={<E2ETestingPage />} />
        <Route path="test-runs/:id" element={<TestRunDetails />} />
        <Route path="*" element={<Navigate to="/test-runs" replace />} />
      </Route>
    </Routes>
  );
};
