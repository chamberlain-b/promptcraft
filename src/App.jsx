import React from 'react';
import { PromptProvider } from './context/PromptContext';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
  <PromptProvider>
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  </PromptProvider>
);

export default App;
