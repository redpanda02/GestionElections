"use client"
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminPage = () => {
  // Liste des candidats en attente
  const [candidats, setCandidats] = useState([
    { id: 1, nom: "Jean Dupont", statut: "En attente" },
    { id: 2, nom: "Marie Curie", statut: "En attente" },
  ]);

  // Fonction pour mettre à jour le statut d'une candidature
  const updateCandidature = (id: number, statut: string) => {
    setCandidats(candidats.map(c => (c.id === id ? { ...c, statut } : c)));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isConnected={true} />

      <main className="flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg space-y-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Gestion des Candidatures
          </h1>

          {/* Tableau des candidatures */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left">Nom</th>
                  <th className="py-3 px-6 text-left">Statut</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidats.map((candidat) => (
                  <tr key={candidat.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-6">{candidat.nom}</td>
                    <td className="py-3 px-6">{candidat.statut}</td>
                    <td className="py-3 px-6 text-center space-x-2">
                      {candidat.statut === "En attente" && (
                        <>
                          <button
                            onClick={() => updateCandidature(candidat.id, "Validé")}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => updateCandidature(candidat.id, "Refusé")}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                          >
                            Refuser
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
