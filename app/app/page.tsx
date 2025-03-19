import Link from 'next/link';
import Navbar from './../components/Navbar';
import Footer from './../components/Footer';
import React from 'react';

export default function Home() {
  return (
    <>
      <Navbar  isConnected={false} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-20 px-6">
        <div className="  w-full max-w-3xl  bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg space-y-8">
          {/* Section 1 : Titre principal et description */}
          <div className="text-center">
            <h1 className="mb-4 text-xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
            Numérisation des parrainages électoraux
            </h1>
            <p className=" italic mb-6 text-lg font-normal text-gray-500 lg:text-base sm:px-16 xl:px-48 dark:text-gray-400">
            Simplifiez et sécurisez le processus de parrainage des candidats grâce à notre plateforme numérique innovante.            </p>
          </div>

          {/* Section 2 : À propos de nous */}
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              À propos de nous
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
            Dans le cadre de la modernisation des procédures administratives liées aux élections au Sénégal, nous avons développé une solution numérique pour faciliter la gestion des parrainages. Notre plateforme permet aux citoyens de parrainer leurs candidats de manière simple, rapide et sécurisée.            </p>
          </div>

          {/* Section 3 : Nos services */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nos services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service 1 */}
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Parrainage en ligne                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                Grâce à notre plateforme, les citoyens peuvent parrainer leurs candidats en ligne en quelques clics, sans avoir à remplir manuellement des formulaires papier.                </p>
              </div>

              {/* Service 2 */}
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sécurité et transparence                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                Nous garantissons la sécurité des données et la transparence du processus de parrainage grâce à des technologies de pointe et des protocoles robustes.                </p>
              </div>
            </div>
          </div>

              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Comment ça marche ?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Le processus est simple et intuitif :
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mt-2">
                  <li>Inscrivez-vous sur la plateforme en utilisant votre carte d'identité et votre carte électeur.</li>
                  <li>Accédez à votre espace personnel et visualisez la liste des candidats.</li>
                  <li>Validez votre parrainage en quelques étapes sécurisées.</li>
                </ul>
              </div>

          {/* Section 4 : Appel à l'action */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
            Rejoignez-nous dès aujourd'hui et contribuez à la modernisation des élections au Sénégal.            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}