// components/Sidebar.tsx
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock function to check authentication status
const checkAuth = async () => {
  // Replace with your actual authentication logic
  return new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(true), 500); // Simulate an authenticated user after 0.5 seconds
  });
};

const Sidebar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };

    fetchAuthStatus();
  }, []);

  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">
        <Link href="/">
          <span>Logo</span>
        </Link>
      </div>
      <div className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <span className="block px-4 py-2 hover:bg-gray-700">Home</span>
            </Link>
          </li>
          {isAuthenticated === null ? (
            <li className="block px-4 py-2">Loading...</li>
          ) : isAuthenticated ? (
            <>
              <li>
                <Link href="/account">
                  <span className="block px-4 py-2 hover:bg-gray-700">My Account</span>
                </Link>
              </li>
              <li>
                <Link href="/subscription">
                  <span className="block px-4 py-2 hover:bg-gray-700">Subscription</span>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/products">
                  <span className="block px-4 py-2 hover:bg-gray-700">Products</span>
                </Link>
              </li>
              <li>
                <Link href="/login">
                  <span className="block px-4 py-2 hover:bg-gray-700">Login</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
