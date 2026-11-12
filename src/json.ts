/**
 * A value that Emojion can hold: the same values JSON can hold. `parse()`
 * returns one.
 *
 * @example
 * import { parse } from 'emj';
 * import type { Json } from 'emj';
 *
 * const value: Json = parse('🙌😠🕐✋'); // { a: 1 }
 */
export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json };
