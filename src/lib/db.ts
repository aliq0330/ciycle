/**
 * db.ts — Tüm veritabanı READ işlemleri bu modülden yapılmalı.
 *
 * Supabase JS SDK'sı sayfa yenilemesinde auth state machine nedeniyle
 * askıya alınıyor. Bu modül SDK'yı bypass ederek PostgREST REST API'sine
 * doğrudan fetch atar — güvenilir, zaman aşımı olan, auth bağımsız.
 *
 * KURAL:
 *   READ  → dbFrom("tablo").eq(...).execute()   ← bu dosya
 *   WRITE → getSupabaseClient().from(...)        ← supabase/client.ts
 */

import { restGet, withAbort } from "./supabase/rest";

export { withAbort } from "./supabase/rest";

type FilterVal = string | number | boolean;

export class DbQuery<T = Record<string, unknown>> {
  private _table: string;
  private _params: string[] = ["select=*"];
  private _signal?: AbortSignal;

  constructor(table: string) {
    this._table = table;
  }

  select(cols: string) {
    this._params[0] = `select=${cols}`;
    return this;
  }

  eq(col: string, val: FilterVal) {
    this._params.push(`${col}=eq.${encodeURIComponent(String(val))}`);
    return this;
  }

  neq(col: string, val: FilterVal) {
    this._params.push(`${col}=neq.${encodeURIComponent(String(val))}`);
    return this;
  }

  in(col: string, vals: string[]) {
    if (vals.length === 0) return this;
    this._params.push(`${col}=in.(${vals.map((v) => `"${v}"`).join(",")})`);
    return this;
  }

  notIn(col: string, vals: string[]) {
    if (vals.length === 0) return this;
    this._params.push(
      `${col}=not.in.(${vals.map((v) => `"${v}"`).join(",")})`
    );
    return this;
  }

  ilike(col: string, pattern: string) {
    this._params.push(`${col}=ilike.${encodeURIComponent(pattern)}`);
    return this;
  }

  is(col: string, val: null | boolean) {
    this._params.push(
      `${col}=is.${val === null ? "null" : String(val)}`
    );
    return this;
  }

  /** PostgREST or filtresi: or("col1.ilike.*term*,col2.ilike.*term*") */
  or(filter: string) {
    this._params.push(`or=(${filter})`);
    return this;
  }

  order(col: string, ascending = false) {
    this._params.push(`order=${col}.${ascending ? "asc" : "desc"}`);
    return this;
  }

  limit(n: number) {
    this._params.push(`limit=${n}`);
    return this;
  }

  offset(n: number) {
    this._params.push(`offset=${n}`);
    return this;
  }

  /** from–to dahil, Supabase SDK .range() ile aynı */
  range(from: number, to: number) {
    this._params.push(`offset=${from}`, `limit=${to - from + 1}`);
    return this;
  }

  signal(signal: AbortSignal) {
    this._signal = signal;
    return this;
  }

  private qs() {
    return `${this._table}?${this._params.join("&")}`;
  }

  /** Tüm satırları döner */
  async execute(): Promise<T[]> {
    return restGet<T[]>(this.qs(), this._signal);
  }

  /** İlk satırı döner, yoksa null */
  async single(): Promise<T | null> {
    const rows = await this.limit(1).execute();
    return rows[0] ?? null;
  }
}

/**
 * Yeni bir read sorgusu başlatır.
 *
 * @example
 * const profile = await dbFrom("profiles").eq("username", slug).single();
 * const posts   = await dbFrom("posts").eq("author_id", uid).order("created_at").offset(0).limit(20).execute();
 */
export function dbFrom<T = Record<string, unknown>>(
  table: string
): DbQuery<T> {
  return new DbQuery<T>(table);
}
