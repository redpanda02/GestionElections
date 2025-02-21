// app/api/signup/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { fullName, email, password } = await request.json();

  // Effectuer la logique d'enregistrement ici (par exemple, stockage en base de données)
  // Vous pouvez également valider les données ici.

  return NextResponse.json({ message: 'Utilisateur créé avec succès.' });
}
