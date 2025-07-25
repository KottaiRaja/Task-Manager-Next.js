'use client'

import './globals.css';

import { Provider } from 'react-redux';
import store from '@/redux/store';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
