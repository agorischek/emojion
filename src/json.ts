/**
 * A value that Emojion can hold: the same values JSON can hold.
 */
export type Json =
  string | number | boolean | null | Json[] | { [key: string]: Json };
