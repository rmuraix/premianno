import { uxp } from "../globals";
import * as premierepro from "./premierepro";

const hostName =
  uxp?.host?.name.toLowerCase().replace(/\s/g, "") || ("" as string);

// prettier-ignore
let host = {} as typeof premierepro;

if (hostName.startsWith("premierepro")) host = premierepro;

export const api = host;
