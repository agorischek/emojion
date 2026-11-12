/**
 * The deepest an array or object may be nested. Both `parse()` and
 * `stringify()` enforce it, so anything one produces the other accepts.
 * It keeps very deep input from overflowing the call stack.
 */
export const MAX_DEPTH = 512;
