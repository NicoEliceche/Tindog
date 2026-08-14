import { ApiAuthError, requireAuthenticatedUser } from '@core/auth/requestAuth';
import prisma from '@core/data/client/PrismaClient';
import { enforceRateLimit } from '@core/security/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import { withAuthCors } from '../auth/cors';

export const runtime = 'nodejs';
type GooglePlace = { id?: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude?: number; longitude?: number }; primaryType?: string };
export async function OPTIONS(request: NextRequest) { return withAuthCors(new NextResponse(null, { status: 204 }), request, 'GET, OPTIONS'); }

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request); const rate = await enforceRateLimit(`places:${user.id}`, 60, 60 * 60 * 1000); if (!rate.allowed) { const response = NextResponse.json({ error: 'Places rate limit reached' }, { status: 429 }); response.headers.set('Retry-After', String(rate.retryAfterSeconds)); return withAuthCors(response, request); }
    const lat = Number(request.nextUrl.searchParams.get('lat')); const lng = Number(request.nextUrl.searchParams.get('lng')); const radius = Math.min(20_000, Math.max(500, Number(request.nextUrl.searchParams.get('radius') ?? 5000)));
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      const curated = await prisma.location.findMany({ where: { isActive: true }, take: 50, select: { id: true, placeId: true, name: true, address: true, type: true, lat: true, lng: true, reviews: { select: { rating: true } } } });
      const response = NextResponse.json(curated.map((item) => ({ ...item, source: 'tindog_curated', reviewCount: item.reviews.length, rating: item.reviews.length ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length : null, reviews: undefined })));
      response.headers.set('Cache-Control', 'private, no-store'); return withAuthCors(response, request);
    }
    const googleResponse = await fetch('https://places.googleapis.com/v1/places:searchNearby', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType' }, body: JSON.stringify({ includedTypes: ['park', 'cafe', 'pet_store', 'veterinary_care', 'police'], maxResultCount: 20, rankPreference: 'DISTANCE', locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } } }), cache: 'no-store' });
    if (!googleResponse.ok) throw new Error(`Google Places returned ${googleResponse.status}`); const data = await googleResponse.json() as { places?: GooglePlace[] }; const places = (data.places ?? []).filter((item): item is GooglePlace & { id: string } => Boolean(item.id)); const placeIds = places.map((item) => item.id);
    const tindogLocations = await prisma.location.findMany({ where: { placeId: { in: placeIds }, isActive: true }, select: { id: true, placeId: true, reviews: { select: { rating: true } } } }); const byPlaceId = new Map(tindogLocations.map((item) => [item.placeId, item]));
    const payload = places.map((place) => { const tindog = byPlaceId.get(place.id); const ratings = tindog?.reviews.map((item) => item.rating) ?? []; return { googlePlaceId: place.id, tindogLocationId: tindog?.id ?? null, name: place.displayName?.text ?? 'Punto público', address: place.formattedAddress ?? '', type: place.primaryType ?? 'public_place', coordinates: { lat: place.location?.latitude, lng: place.location?.longitude }, source: 'google_live', tindogReviewCount: ratings.length, tindogRating: ratings.length ? Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)) : null }; });
    const response = NextResponse.json(payload); response.headers.set('Cache-Control', 'private, no-store'); return withAuthCors(response, request);
  } catch (error) { const status = error instanceof ApiAuthError ? error.status : 502; if (!(error instanceof ApiAuthError)) console.error('Places lookup failed', error); return withAuthCors(NextResponse.json({ error: status === 502 ? 'Places are temporarily unavailable' : error instanceof Error ? error.message : 'Unauthorized' }, { status }), request); }
}
