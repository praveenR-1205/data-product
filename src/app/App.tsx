import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './providers';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
