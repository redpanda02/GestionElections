'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface FormData {
  cni: string;
  password: string;
  nce: string;
  role: 'candidate' | 'voter'; // Nouveau champ pour le rôle
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [message, setMessage] = useState("");
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      // Envoi des données de connexion (numéro de CNI, mot de passe et rôle) au backend
      const response = await axios.post('/api/login', data);
      setMessage('Connexion réussie');

      // Rediriger l'utilisateur en fonction de son rôle
      setTimeout(() => {
        if (data.role === 'candidate') {
          router.push('/candidate-dashboard'); // Redirection vers le tableau de bord candidat
        } else {
          router.push('/voter-dashboard'); // Redirection vers le tableau de bord électeur
        }
      }, 2000); // Attendre 2 secondes avant la redirection
    } catch (error) {
      setMessage('Numéro de CNI ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Connexion
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Champ CNI */}
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

          {/* Bouton de connexion */}
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-700 dark:bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Se connecter
            </button>
          </div>
        </form>

        {/* Message de retour */}
        {message && (
          <p className="text-center text-sm mt-4 text-gray-500 dark:text-gray-400">
            {message}
          </p>
        )}

        {/* Lien vers la page d'inscription */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous n'avez pas de compte ?{' '}
            <a
              href="/signup"
              className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
            >
              Inscrivez-vous
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}