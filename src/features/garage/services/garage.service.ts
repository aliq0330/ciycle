import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, withAbort } from "@/lib/supabase/rest";
import type { Vehicle } from "@/types";
import type { Database } from "@/lib/supabase/types";
import type { VehicleInput } from "../validations";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    user_id: row.user_id,
    make: row.make,
    model: row.model,
    year: row.year,
    type: row.type,
    color: row.color,
    plate_number: row.plate_number,
    odometer_km: row.odometer_km,
    engine_cc: row.engine_cc,
    notes: row.notes,
    cover_image_url: row.cover_image_url,
    is_primary: row.is_primary,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const garageService = {
  async getVehicles(userId: string): Promise<Vehicle[]> {
    if (!userId) return [];
    return withAbort(async (signal) => {
      const rows = await restGet<VehicleRow[]>(
        `vehicles?user_id=eq.${userId}&order=is_primary.desc,created_at.desc`,
        signal
      );
      return rows.map(toVehicle);
    });
  },

  async createVehicle(
    userId: string,
    input: VehicleInput
  ): Promise<Vehicle> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        user_id: userId,
        make: input.make,
        model: input.model,
        year: input.year,
        type: input.type,
        color: input.color ?? null,
        plate_number: input.plate_number ?? null,
        odometer_km: input.odometer_km ?? 0,
        engine_cc: input.engine_cc ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toVehicle(data as VehicleRow);
  },

  async updateVehicle(
    vehicleId: string,
    input: Partial<VehicleInput>
  ): Promise<Vehicle> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("vehicles")
      .update({
        ...(input.make !== undefined && { make: input.make }),
        ...(input.model !== undefined && { model: input.model }),
        ...(input.year !== undefined && { year: input.year }),
        ...(input.type !== undefined && { type: input.type }),
        color: input.color ?? null,
        plate_number: input.plate_number ?? null,
        ...(input.odometer_km !== undefined && { odometer_km: input.odometer_km }),
        engine_cc: input.engine_cc ?? null,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vehicleId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return toVehicle(data as VehicleRow);
  },

  async setPrimary(vehicleId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    // Clear all primary flags for user, then set the new one
    await supabase
      .from("vehicles")
      .update({ is_primary: false })
      .eq("user_id", userId);

    const { error } = await supabase
      .from("vehicles")
      .update({ is_primary: true })
      .eq("id", vehicleId);

    if (error) throw new Error(error.message);
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    if (error) throw new Error(error.message);
  },
};
