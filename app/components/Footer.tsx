// components/Footer.tsx

import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Vous avez des questions ?{' '}
            <Link
              href="https://dge.sn/contact/"
              className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Contactez-nous
            </Link>
          </p>
          <p className="mt-2">
            En savoir plus sur la{' '}
            <Link
              href="https://dge.sn/"
              className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Direction Générale des Elections
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;