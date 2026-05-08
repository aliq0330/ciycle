import { getSupabaseClient, type SupabaseClient } from "@/lib/supabase/client";
import type { Route, PaginatedResponse, GeoPoint, RouteStats, Waypoint, ElevationPoint } from "@/types";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

async function fetchProfileMap(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, ProfileRow>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase.from("profiles").select("*").in("id", ids);
  return new Map((data ?? []).map((p) => [p.id, p as ProfileRow]));
}

export const routesService = {
  async getRoutes({
    userId,
    page = 0,
    limit = 20,
    difficulty,
    roadType,
    search,
  }: {
    userId?: string;
    page?: number;
    limit?: number;
    difficulty?: Route["difficulty"];
    roadType?: Route["road_type"];
    search?: string;
  }): Promise<PaginatedResponse<Route>> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from("routes")
      .select("*", { count: "exact" })
      .eq("visibility", "public")
      .range(page * limit, (page + 1) * limit - 1)
      .order("created_at", { ascending: false });

    if (difficulty) query = query.eq("difficulty", difficulty);
    if (roadType) query = query.eq("road_type", roadType);
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw new Error(`routes query failed: ${error.message} (code: ${error.code})`);

    const rows = data ?? [];
    const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
    const profileMap = await fetchProfileMap(supabase, authorIds);

    const routes = rows.map((row) =>
      mapRoute({ ...row, author: profileMap.get(row.author_id) ?? null }, false, false)
    );

    return {
      data: routes,
      total: count ?? 0,
      page,
      limit,
      has_more: (page + 1) * limit < (count ?? 0),
    };
  },

  async getRoute(id: string, _userId?: string): Promise<Route> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    const { data: author } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.author_id)
      .maybeSingle();

    return mapRoute({ ...data, author }, false, false);
  },

  async createRoute(payload: {
    author_id: string;
    title: string;
    description?: string;
    road_type: Route["road_type"];
    difficulty: Route["difficulty"];
    visibility?: Route["visibility"];
    stats: RouteStats;
    waypoints?: Waypoint[];
    elevation_profile?: ElevationPoint[];
    gpx_url?: string;
    cover_image_url?: string;
    tags?: string[];
    start_location: GeoPoint;
    end_location: GeoPoint;
    bbox?: Route["bbox"];
    club_id?: string;
  }): Promise<Route> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("routes")
      .insert({
        author_id: payload.author_id,
        title: payload.title,
        description: payload.description ?? null,
        road_type: payload.road_type,
        difficulty: payload.difficulty,
        visibility: payload.visibility ?? "public",
        stats: payload.stats as unknown as import("@/lib/supabase/types").Json,
        waypoints: (payload.waypoints ?? []) as unknown as import("@/lib/supabase/types").Json,
        elevation_profile: (payload.elevation_profile ?? []) as unknown as import("@/lib/supabase/types").Json,
        gpx_url: payload.gpx_url ?? null,
        cover_image_url: payload.cover_image_url ?? null,
        tags: payload.tags ?? [],
        start_location: payload.start_location as unknown as import("@/lib/supabase/types").Json,
        end_location: payload.end_location as unknown as import("@/lib/supabase/types").Json,
        bbox: payload.bbox ?? [0, 0, 0, 0],
        club_id: payload.club_id ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: author } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.author_id)
      .maybeSingle();

    return mapRoute({ ...data, author }, false, false);
  },

  async parseGpxFile(file: File): Promise<{
    waypoints: Waypoint[];
    stats: RouteStats;
    elevation_profile: ElevationPoint[];
    start_location: GeoPoint;
    end_location: GeoPoint;
    bbox: Route["bbox"];
  }> {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "application/xml");

    const trkpts = Array.from(doc.querySelectorAll("trkpt"));
    if (trkpts.length === 0) throw new Error("Geçerli GPX dosyası değil");

    const points = trkpts.map((pt) => ({
      lat: parseFloat(pt.getAttribute("lat") ?? "0"),
      lng: parseFloat(pt.getAttribute("lon") ?? "0"),
      ele: parseFloat(pt.querySelector("ele")?.textContent ?? "0"),
    }));

    let distance = 0;
    let elevGain = 0;
    let elevLoss = 0;
    let minEle = Infinity;
    let maxEle = -Infinity;

    const elevProfile: ElevationPoint[] = [];

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      minEle = Math.min(minEle, p.ele);
      maxEle = Math.max(maxEle, p.ele);

      if (i > 0) {
        const prev = points[i - 1];
        const d = haversineDistance(prev.lat, prev.lng, p.lat, p.lng);
        distance += d;

        const diff = p.ele - prev.ele;
        if (diff > 0) elevGain += diff;
        else elevLoss += Math.abs(diff);
      }

      if (i % Math.max(1, Math.floor(points.length / 100)) === 0) {
        elevProfile.push({ distance_m: Math.round(distance), elevation_m: p.ele });
      }
    }

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);

    return {
      waypoints: [
        { id: "start", position: { lat: points[0].lat, lng: points[0].lng }, name: "Başlangıç", type: "start", description: null },
        { id: "end", position: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng }, name: "Bitiş", type: "end", description: null },
      ],
      stats: {
        distance_km: parseFloat((distance / 1000).toFixed(2)),
        elevation_gain_m: Math.round(elevGain),
        elevation_loss_m: Math.round(elevLoss),
        max_elevation_m: Math.round(maxEle),
        min_elevation_m: Math.round(minEle),
        estimated_duration_min: Math.round(distance / 1000 / 40 * 60),
      },
      elevation_profile: elevProfile,
      start_location: { lat: points[0].lat, lng: points[0].lng },
      end_location: { lat: points[points.length - 1].lat, lng: points[points.length - 1].lng },
      bbox: [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
    };
  },
};

function mapRoute(
  row: Record<string, unknown>,
  is_liked: boolean,
  is_saved: boolean
): Route {
  return {
    id: row.id as string,
    author_id: row.author_id as string,
    author: row.author as Route["author"],
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    road_type: row.road_type as Route["road_type"],
    difficulty: row.difficulty as Route["difficulty"],
    visibility: row.visibility as Route["visibility"],
    stats: row.stats as unknown as RouteStats,
    waypoints: (row.waypoints as unknown as Waypoint[]) ?? [],
    elevation_profile: (row.elevation_profile as unknown as ElevationPoint[]) ?? [],
    gpx_url: (row.gpx_url as string | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    tags: (row.tags as string[]) ?? [],
    start_location: row.start_location as unknown as GeoPoint,
    end_location: row.end_location as unknown as GeoPoint,
    bbox: (row.bbox as unknown as Route["bbox"]) ?? [0, 0, 0, 0],
    likes_count: (row.likes_count as number) ?? 0,
    saves_count: (row.saves_count as number) ?? 0,
    rides_count: (row.rides_count as number) ?? 0,
    comments_count: (row.comments_count as number) ?? 0,
    is_liked,
    is_saved,
    club_id: (row.club_id as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
