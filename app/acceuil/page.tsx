// app/acceuil/page.tsx

import React from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Footer from '../components/Footer'

const AcceuilPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isConnected={true}/>

      <main className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg space-y-8">
          {/* Section de bienvenue */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Bienvenue !
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Choisissez votre candidat et parrainez le !
            </p>
          </div>

          {/* Section pour afficher le tableau */}
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Liste des Candidats
            </h2>
            <Table /> {/* Votre composant Table ici */}
          </div>

        </div>
      </main>
      <Footer/>
    </div>
    
  );
};

export default AcceuilPage;
