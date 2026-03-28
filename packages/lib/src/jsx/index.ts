// @include './lib/json2.js'

import { ns } from "../shared/shared";

import * as ppro from "./ppro/ppro";

//@ts-expect-error
const host = typeof $ !== "undefined" ? $ : window;

// This extension is declared as PPRO-only in cep.config.ts `hosts`,
// so always register scripts on the namespace.
host[ns] = ppro;

const empty = {};
// prettier-ignore
export type Scripts = typeof empty & typeof ppro;
