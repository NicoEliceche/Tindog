import { ApiAuthError, assertTrustedWriteOrigin, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';

export const runtime = 'nodejs';

type JsonObject = Record<string, unknown>;
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const stringList = (value: unknown, maxItems: number, maxLength: number) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, maxItems).map((item) => item.trim().slice(0, maxLength)).filter(Boolean) : [];

function errorResponse(error: unknown, request: NextRequest) {
  if (error instanceof ApiAuthError) return withAuthCors(NextResponse.json({ error: error.message }, { status: error.status }), request);
  console.error('Pet API failed', error);
  return withAuthCors(NextResponse.json({ error: 'Unable to process pets' }, { status: 500 }), request);
}

export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, POST, OPTIONS'); }

export async function GET(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json([]), request);
  try {
    const user = await requireAuthenticatedUser(request); const mine = request.nextUrl.searchParams.get('owner') === 'me'; const query = text(request.nextUrl.searchParams.get('query'), 80);
    const pets = await prisma.pet.findMany({
      where: {
        ...(mine ? { ownerId: user.id } : { ownerId: { not: user.id }, breedingPrefs: { is: { looking_for_pair: true } } }),
        ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { breed: { contains: query, mode: 'insensitive' } }] } : {}),
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
      include: mine ? { competitions: true, healthRecords: true, breedingPrefs: true } : { breedingPrefs: true },
    });
    const response = pets.map((pet) => ({
      id: pet.id, name: pet.name, breed: pet.breed, gender: pet.gender, age: pet.age, weight: pet.weight, bio: pet.bio ?? '', photos: pet.photos,
      owner_ids: mine ? [user.id] : [], personality_traits: pet.personality_traits, has_papers: pet.has_papers, paper_types: mine ? pet.paper_types : [], is_competitor: pet.is_competitor,
      breeding_preferences: pet.breedingPrefs ? { looking_for_pair: pet.breedingPrefs.looking_for_pair, ...(mine ? { terms: pet.breedingPrefs.terms, last_heat_cycle: pet.breedingPrefs.last_heat_cycle } : {}) } : undefined,
      coi_percentage: mine ? pet.coiPercentage : undefined, is_verified_breeder_pet: pet.isVerifiedBreederPet,
      ...(mine ? { competitions: 'competitions' in pet ? pet.competitions : [], health_records: 'healthRecords' in pet ? pet.healthRecords : [] } : {}),
    }));
    return withAuthCors(NextResponse.json(response), request);
  } catch (error) { return errorResponse(error, request); }
}

export async function POST(request: NextRequest) {
  if (isGitHubPagesStaticBuild()) return withAuthCors(NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 }), request);
  try {
    assertTrustedWriteOrigin(request); const user = await requireAuthenticatedUser(request);
    const contentLength = Number(request.headers.get('content-length') ?? 0); if (contentLength > 64_000) return withAuthCors(NextResponse.json({ error: 'Payload is too large' }, { status: 413 }), request);
    const data = await request.json() as JsonObject; const name = text(data.name, 60); const breed = text(data.breed, 80); const bio = text(data.bio, 1000); const age = Number(data.age); const weight = data.weight == null ? null : Number(data.weight); const gender = data.gender;
    if (!name || !breed || (gender !== 'Macho' && gender !== 'Hembra') || !Number.isInteger(age) || age < 0 || age > 30 || (weight !== null && (!Number.isFinite(weight) || weight <= 0 || weight > 200))) return withAuthCors(NextResponse.json({ error: 'Invalid pet data' }, { status: 400 }), request);
    const photos = stringList(data.photos, 8, 2048).filter((url) => { try { return new URL(url).protocol === 'https:'; } catch { return false; } });
    const prefs = data.breeding_preferences && typeof data.breeding_preferences === 'object' ? data.breeding_preferences as JsonObject : null;
    const pet = await prisma.pet.create({ data: {
      ownerId: user.id, name, breed, gender, age, weight, bio, photos, personality_traits: stringList(data.personality_traits, 10, 40), has_papers: Boolean(data.has_papers), paper_types: stringList(data.paper_types, 12, 60), is_competitor: Boolean(data.is_competitor), isVerifiedBreederPet: false,
      breedingPrefs: prefs ? { create: { looking_for_pair: Boolean(prefs.looking_for_pair), terms: text(prefs.terms, 500) || null, last_heat_cycle: text(prefs.last_heat_cycle, 40) || null } } : undefined,
    }, include: { breedingPrefs: true } });
    return withAuthCors(NextResponse.json(pet, { status: 201 }), request);
  } catch (error) { return errorResponse(error, request); }
}
