import { type FC } from 'react';
import { PromptProvider } from './context/PromptContext';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

const App: FC = () => (
  <PromptProvider>
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  </PromptProvider>
);

export default App;
