import React from 'react';

const CandidateTable = () => {
    const candidates = [
        { name: "John Doe", category: "Software Engineer", coalition: "Les cons" },
        { name: "Jane Smith", category: "Designer", coalition: "Les polytech" },
        { name: "Alice Brown", category: "Product Manager", coalition: "Bou bakh bi" },
        { name: "Bob Johnson", category: "Marketing", coalition: "Yolo" },
        { name: "Charlie Lee", category: "Data Scientist", coalition: "Senegal Emergent" }
    ];

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Nom du candidat
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Métier
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Coalition
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Parrainer
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((candidate, index) => (
                        <tr key={index} className={`odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200`}>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {candidate.name}
                            </th>
                            <td className="px-6 py-4">
                                {candidate.category}
                            </td>
                            <td className="px-6 py-4">
                                {candidate.coalition}
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
