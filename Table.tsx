import React, { useEffect, useState } from 'react';

const CandidateTable = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/v1/candidats')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des candidats');
                }
                return response.json();
            })
            .then(data => {
                // Assuming the API returns an object with a 'data' property
                setCandidates(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Nom du candidat
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Email
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Parti
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Parrainer
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((candidate, index) => (
                        <tr key={index} className="odd:bg-white dark:odd:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {candidate.nom} {candidate.prenom}
                            </th>
                            <td className="px-6 py-4">
                                {candidate.email}
                            </td>
                            <td className="px-6 py-4">
                                {candidate.parti}
                            </td>
                            <td className="px-6 py-4">
                                <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                    Parrainer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CandidateTable;
