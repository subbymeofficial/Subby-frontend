/**
 * Geolocation helper.
 *
 * Resolves the user's current coordinates using Capacitor on native
 * and the Web Geolocation API in browsers. Also provides a free
 * reverse-geocode via OpenStreetMap Nominatim.
 */
import { isNative } from "./platform";

export type Coords = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type PlaceInfo = {
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
  display?: string;
};

export async function getCurrentCoords(): Promise<Coords | null> {
  if (isNative()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== "granted" && perm.coarseLocation !== "granted") {
        return null;
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10_000,
      });
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch {
      return null;
    }
  }

  if (!("geolocation" in navigator)) return null;

  return new Promise<Coords | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  });
}

export async function reverseGeocode(
  coords: Coords,
): Promise<PlaceInfo | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(coords.lat));
    url.searchParams.set("lon", String(coords.lng));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        "Accept-Language": "en",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();

    const addr = data.address || {};
    const city: string | undefined =
      addr.city || addr.town || addr.village || addr.suburb || addr.municipality;

    const country: string | undefined = addr.country;
    const countryCode: string | undefined = addr.country_code
      ? String(addr.country_code).toUpperCase()
      : undefined;

    const state: string | undefined = addr.state || addr.region;
    return {
      country,
      countryCode,
      state,
      city,
      display: data.display_name,
    };
  } catch {
    return null;
  }
}

export async function getCurrentPlace(): Promise<PlaceInfo | null> {
  const coords = await getCurrentCoords();
  if (!coords) return null;
  return reverseGeocode(coords);
}
