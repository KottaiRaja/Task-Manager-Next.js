

import './globals.css';

export const metadata = {
  title: 'My Task Manager App',
  description: 'A simple CRUD task manager built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
