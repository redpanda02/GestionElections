'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface FormData {
  fullName: string;
  cni: string;
  password: string;
  nce: string;
  role: 'candidate' | 'voter'; // Nouveau champ pour le rôle
}

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [message, setMessage] = useState(""); // Message à l'utilisateur
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      // Envoi des données d'inscription à votre backend
      const response = await axios.post('/api/signup', data);
      setMessage('Inscription réussie ! Veuillez vous connecter.');

      // Rediriger l'utilisateur vers la page de connexion après l'inscription réussie
      setTimeout(() => {
        router.push('/login');
      }, 2000); // Attendre 2 secondes avant la redirection
    } catch (error) {
      setMessage('Une erreur est survenue.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Créez votre compte
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Champ Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Nom complet
            </label>
            <input
              {...register('fullName', { required: "Ce champ est obligatoire" })}
              className="mt-2 block w-full rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-gray-600 focus:border-blue-500"
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Champ Numéro de CNI */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Numéro de CNI
            </label>
            <input
              {...register('cni', { required: "Ce champ est obligatoire" })}
              className="mt-2 block w-full rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-gray-600 focus:border-blue-500"
            />
            {errors.cni && (
              <p className="text-red-600 text-sm mt-1">{errors.cni.message}</p>
            )}
          </div>

          {/* Champ Numéro de carte électeur */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Numéro de carte électeur
            </label>
            <input
              {...register('nce', { required: "Ce champ est obligatoire" })}
              className="mt-2 block w-full rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-gray-600 focus:border-blue-500"
            />
            {errors.nce && (
              <p className="text-red-600 text-sm mt-1">{errors.nce.message}</p>
            )}
          </div>

          {/* Champ Rôle (Candidat ou Électeur) */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Vous êtes :
            </label>
            <div className="mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="voter"
                  {...register('role', { required: "Ce champ est obligatoire" })}
                  className="form-radio h-4 w-4 text-blue-600 dark:text-blue-500"
                />
                <span className="ml-2 text-gray-900 dark:text-gray-300">Électeur</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="candidate"
                  {...register('role', { required: "Ce champ est obligatoire" })}
                  className="form-radio h-4 w-4 text-blue-600 dark:text-blue-500"
                />
                <span className="ml-2 text-gray-900 dark:text-gray-300">Candidat</span>
              </label>
            </div>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-300">
              Mot de passe
            </label>
            <input
              type="password"
              {...register('password', { required: "Ce champ est obligatoire" })}
              className="mt-2 block w-full rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-base text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 dark:border-gray-600 focus:border-blue-500"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Bouton d'inscription */}
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-700 dark:bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              S'inscrire
            </button>
          </div>
        </form>

        {/* Message de retour */}
        {message && (
          <p className="text-center text-sm mt-4 text-gray-500 dark:text-gray-400">
            {message}
          </p>
        )}

        {/* Lien vers la page de connexion */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte ?{' '}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Connectez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}