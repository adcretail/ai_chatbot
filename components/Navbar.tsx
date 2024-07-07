// components/Navbar.tsx

import Link from 'next/link';

const Navbar = () => {
    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center">
                <Link href="/">
                    <span className="text-xl font-bold">
                        {/* Replace with your logo */}
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                    </span>
                </Link>
            </div>
            <div className="flex space-x-4">
                <Link href="/rag">
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded">
                        RAG
                    </span>
                </Link>
                <Link href="/pricing">
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded">
                        Pricing
                    </span>
                </Link>
                <Link href="/login">
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded">
                        Login
                    </span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
