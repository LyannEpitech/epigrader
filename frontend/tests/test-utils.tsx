import { ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../src/contexts/NotificationContext';

export function renderWithProviders(ui: ReactNode, { withRouter = false } = {}) {
  const content = (
    <NotificationProvider>
      {ui}
    </NotificationProvider>
  );
  
  if (withRouter) {
    return rtlRender(<BrowserRouter>{content}</BrowserRouter>);
  }
  
  return rtlRender(content);
}

export * from '@testing-library/react';