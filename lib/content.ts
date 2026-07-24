// Reads place/province content from the database (migrated from markdown so
// non-dev staff can manage it in the admin). Getters are async + React-cached
// so all callers in a request share a single query per collection.
import { cache } from "react";
import type {
  Place as PlaceRow,
  Province as ProvinceRow,
  Hotel as HotelRow,
} from "@prisma/client";
import { prisma } from "./prisma";

export type ImageCredit = {
  author: string;
  source: string;
  sourceUrl: string;
  license?: string;
};
export type Affiliate = { label: string; url: string };
export type GalleryImage = { url: string; caption?: string };

export type Place = {
  slug: string;
  name: string;
  category: string;
  province: string;
  summary: string;
  image: string;
  imageCredit?: ImageCredit;
  address?: string;
  hours?: string;
  priceRange?: string;
  lat?: number;
  lng?: number;
  affiliate?: Affiliate;
  // 0 = ปกติ, 1 = featured (ขึ้นบน), 2 = พาร์ทเนอร์จ่ายเงิน
  sponsored: 0 | 1 | 2;
  body: string;
};

export type Province = {
  slug: string;
  name: string;
  nameEn: string;
  region: string;
  summary: string;
  image: string;
  imageCredit?: ImageCredit;
  featured: boolean;
  body: string;
};

// Hotel = Place without the category taxonomy; affiliate holds the booking link.
export type Hotel = {
  slug: string;
  name: string;
  province: string;
  summary: string;
  image: string;
  imageCredit?: ImageCredit;
  gallery?: GalleryImage[];
  address?: string;
  priceRange?: string;
  lat?: number;
  lng?: number;
  affiliate?: Affiliate;
  sponsored: 0 | 1 | 2;
  body: string;
};

// Prisma keeps nested objects as JSON and empty columns as null; normalise to
// the DTO shape the rest of the app expects (optional fields, not null).
function toPlace(r: PlaceRow): Place {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category,
    province: r.province,
    summary: r.summary,
    image: r.image,
    imageCredit: (r.imageCredit as unknown as ImageCredit) ?? undefined,
    address: r.address ?? undefined,
    hours: r.hours ?? undefined,
    priceRange: r.priceRange ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    affiliate: (r.affiliate as unknown as Affiliate) ?? undefined,
    sponsored: (r.sponsored as 0 | 1 | 2) ?? 0,
    body: r.body,
  };
}

function toHotel(r: HotelRow): Hotel {
  return {
    slug: r.slug,
    name: r.name,
    province: r.province,
    summary: r.summary,
    image: r.image,
    imageCredit: (r.imageCredit as unknown as ImageCredit) ?? undefined,
    gallery: (r.gallery as unknown as GalleryImage[]) ?? undefined,
    address: r.address ?? undefined,
    priceRange: r.priceRange ?? undefined,
    lat: r.lat ?? undefined,
    lng: r.lng ?? undefined,
    affiliate: (r.affiliate as unknown as Affiliate) ?? undefined,
    sponsored: (r.sponsored as 0 | 1 | 2) ?? 0,
    body: r.body,
  };
}

function toProvince(r: ProvinceRow): Province {
  return {
    slug: r.slug,
    name: r.name,
    nameEn: r.nameEn,
    region: r.region,
    summary: r.summary,
    image: r.image,
    imageCredit: (r.imageCredit as unknown as ImageCredit) ?? undefined,
    featured: r.featured,
    body: r.body,
  };
}

// One query per collection per request (deduped across the getters below).
const allPlaces = cache(async (): Promise<Place[]> => {
  return (await prisma.place.findMany()).map(toPlace);
});
const allProvinces = cache(async (): Promise<Province[]> => {
  return (await prisma.province.findMany()).map(toProvince);
});
const allHotels = cache(async (): Promise<Hotel[]> => {
  return (await prisma.hotel.findMany()).map(toHotel);
});

// Paid/featured float to the top, then alphabetical by Thai name.
function bySponsorThenName(a: { sponsored: number; name: string }, b: { sponsored: number; name: string }) {
  if (a.sponsored !== b.sponsored) return b.sponsored - a.sponsored;
  return a.name.localeCompare(b.name, "th");
}

export async function getAllProvinces(): Promise<Province[]> {
  return allProvinces();
}

export async function getProvince(slug: string): Promise<Province | undefined> {
  return (await allProvinces()).find((p) => p.slug === slug);
}

export async function getProvincesByRegion(regionSlug: string): Promise<Province[]> {
  return (await allProvinces()).filter((p) => p.region === regionSlug);
}

export async function getFeaturedProvinces(): Promise<Province[]> {
  return (await allProvinces()).filter((p) => p.featured);
}

export async function getAllPlaces(): Promise<Place[]> {
  return allPlaces();
}

export async function getPlace(slug: string): Promise<Place | undefined> {
  return (await allPlaces()).find((p) => p.slug === slug);
}

export async function getPlacesByProvince(provinceSlug: string): Promise<Place[]> {
  return (await allPlaces())
    .filter((p) => p.province === provinceSlug)
    .sort(bySponsorThenName);
}

export async function getPlacesByProvinceCategory(
  provinceSlug: string,
  category: string,
): Promise<Place[]> {
  return (await getPlacesByProvince(provinceSlug)).filter(
    (p) => p.category === category,
  );
}

export async function getAllHotels(): Promise<Hotel[]> {
  return allHotels();
}

export async function getHotel(slug: string): Promise<Hotel | undefined> {
  return (await allHotels()).find((h) => h.slug === slug);
}

export async function getHotelsByProvince(provinceSlug: string): Promise<Hotel[]> {
  return (await allHotels())
    .filter((h) => h.province === provinceSlug)
    .sort(bySponsorThenName);
}
