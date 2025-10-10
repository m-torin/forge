'use client';

import { Toaster } from 'react-hot-toast';

const GlobalClient = () => {
  return (
    <div data-testid="global-client">
      <Toaster />
    </div>
  );
};

export default GlobalClient;
