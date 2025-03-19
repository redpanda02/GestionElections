// app/api/signup/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Récupérer les données envoyées par le formulaire d'inscription
  const { fullName, cni, nce, password, role } = await request.json();

  // Ajoutez ici la logique d'enregistrement (vérifications, enregistrement en base de données, etc.)
  console.log('Inscription:', { fullName, cni, nce, password, role });

  return NextResponse.json({ message: 'Utilisateur créé avec succès.' });
}
