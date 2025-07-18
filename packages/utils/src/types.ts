/**
 * Utility to use the any type and avoid linter warnings.
 */
export type Any = any

/**
 * Type or array of type.
 */
export type OrArray<T> = T | T[]

/**
 * Function with any arguments and return type.
 */
export type AnyFunction = (...args: any) => any

/**
 * Any object type with string keys.
 */
export type AnyRecord = Record<string, any>

/**
 * Object with no properties.
 */
export type EmptyRecord = Record<string, never>

/**
 * Any array type, including nested arrays.
 */
export type AnyArray = any[] | any[][]

/**
 * Any type of object key.
 */
export type AnyKey = string | number | symbol

/**
 * Boolean value expressed as a string.
 */
export type BooleanString = 'true' | 'false'

/**
 * JSON value type.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

/**
 * JSON record type.
 */
export type JsonRecord = Record<string, Json>

/**
 * Record keys with dot notation.
 */
export type KeysOf<T> = T extends object
  ? {
      [K in keyof T & string]: K | (T[K] extends object ? `${K}.${KeysOf<T[K]>}` : K)
    }[keyof T & string]
  : never

/**
 * Record of parameters extracted from segments of a string path.
 *
 * @example
 * ```ts
 * type Params = PathParams<'/users/:id/posts/:postId'>
 * // Result: { id: string; postId: string }
 * ```
 */
export type PathParams<S extends string> = S extends `${infer _}:${infer Param}/${infer Rest}`
  ? Record<Param | keyof PathParams<Rest>, string>
  : S extends `${infer _}:${infer Param}`
    ? Record<Param, string>
    : AnyRecord

/**
 * Partial record with non-nullable values.
 */
export type NonNullablePartial<T> = Partial<{
  [K in keyof T]: NonNullable<T[K]>
}>

/**
 * Record with `null` values converted to `undefined`.
 */
export type NullToUndefined<T> = {
  [K in keyof T]: null extends T[K] ? NonNullable<T[K]> | undefined : T[K]
}

/**
 * Type or null type.
 */
export type Nullable<T> = T | null

/**
 * Primitive type.
 */
export type Primitive = string | number | bigint | boolean | null | undefined

/**
 * Record with recursive values.
 */
export interface Recursive<T> {
  [key: string]: Recursive<T> | T
}

/**
 * Record with keys converted from `snake_case` to `camelCase`.
 */
export type SnakeToCamelCase<S extends string | number | symbol> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S

/**
 * String or number type.
 */
export type StringOrNumber = string | number

/**
 * Boolean type from the string representation of boolean.
 */
export type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T

/**
 * String from any type.
 */
export type ToString<T> = T extends string ? T : string

/**
 * Record without the specified keys.
 */
export type Without<T, K> = Pick<T, Exclude<keyof T, K>>

/**
 * URL type.
 */
export type HTTPUrl = `http${string}`

/**
 * Mail URL type.
 */
export type MailToUrl = `mailto:${string}`

/**
 * Telephone URL type.
 */
export type TelUrl = `tel:${string}`

/**
 * Dimension record with height and width.
 */
export interface Dimension {
  height: number
  width: number
}

/**
 * Position record with x and y coordinates.
 */
export interface Position {
  x: number
  y: number
}
