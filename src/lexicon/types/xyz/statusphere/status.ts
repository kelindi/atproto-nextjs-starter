/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from '@atproto/lexicon'
import { lexicons } from '../../../lexicons'
import { isObj, hasProp } from '../../../util'
// @ts-expect-error no types
import { CID } from 'multiformats/cid'

export interface Record {
  status: string
  createdAt: string
  [k: string]: unknown
}

export function isRecord(v: unknown): v is Record {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    (v.$type === 'xyz.statusphere.status#main' ||
      v.$type === 'xyz.statusphere.status')
  )
}

export function validateRecord(v: unknown): ValidationResult {
  return lexicons.validate('xyz.statusphere.status#main', v)
}
