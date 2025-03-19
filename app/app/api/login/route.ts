import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { cni, password, nce, role } = await request.json();

  // Ajoutez ici la vérification des identifiants (ex. requête en base de données)
  console.log('Login attempt:', { cni, password, nce, role });

  // Pour cette démonstration, on renvoie un succès par défaut
  return NextResponse.json({ message: 'Connexion réussie', role });
}