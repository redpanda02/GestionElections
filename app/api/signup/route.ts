import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { fullName, email, password, role } = await request.json();

    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'Cet email est déjà utilisé.' }, { status: 400 });
    }

    // Créer un nouvel utilisateur
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password,  // Assurez-vous de ne pas stocker de mot de passe en clair en production
        role,
      },
    });

    return NextResponse.json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json({ message: 'Une erreur est survenue.' }, { status: 500 });
  }
}
