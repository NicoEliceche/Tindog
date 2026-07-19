import { NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import prisma from '@core/data/client/PrismaClient';

export async function GET() {
  if (isGitHubPagesStaticBuild()) {
    return NextResponse.json([]);
  }

  try {
    const pets = await prisma.pet.findMany({
      include: {
        competitions: true,
        healthRecords: true,
        breedingPrefs: true,
      },
    });
    return NextResponse.json(pets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (isGitHubPagesStaticBuild()) {
    return NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 });
  }

  try {
    const data = await request.json();
    
    // Simple user creation if not exists (for prototype purposes)
    let user = await prisma.user.findUnique({ where: { email: 'test@tindog.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'test@tindog.com', name: 'Tester' }
      });
    }

    const newPet = await prisma.pet.create({
      data: {
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        age: data.age,
        weight: data.weight,
        bio: data.bio,
        photos: data.photos || [],
        personality_traits: data.personality_traits || [],
        has_papers: data.has_papers,
        paper_types: data.paper_types || [],
        is_competitor: data.is_competitor,
        fatherId: data.lineage?.father,
        motherId: data.lineage?.mother,
        coiPercentage: data.coi_percentage,
        isVerifiedBreederPet: data.is_verified_breeder_pet,
        ownerId: user.id,
        competitions: {
          create: data.competitions || []
        },
        healthRecords: {
          create: data.health_records || []
        },
        breedingPrefs: data.breeding_preferences ? {
          create: {
            looking_for_pair: data.breeding_preferences.looking_for_pair,
            terms: data.breeding_preferences.terms,
            last_heat_cycle: data.breeding_preferences.last_heat_cycle,
          }
        } : undefined
      },
      include: {
        competitions: true,
        healthRecords: true,
        breedingPrefs: true
      }
    });

    return NextResponse.json(newPet);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
