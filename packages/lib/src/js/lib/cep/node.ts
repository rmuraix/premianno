// Abstracted built-in Node.js Modules

export const crypto = (
  typeof window.cep !== "undefined" ? require("node:crypto") : {}
) as typeof import("crypto");
export const assert = (
  typeof window.cep !== "undefined" ? require("node:assert") : {}
) as typeof import("assert");
export const buffer = (
  typeof window.cep !== "undefined" ? require("node:buffer") : {}
) as typeof import("buffer");
export const child_process = (
  typeof window.cep !== "undefined" ? require("node:child_process") : {}
) as typeof import("child_process");
export const cluster = (
  typeof window.cep !== "undefined" ? require("node:cluster") : {}
) as typeof import("cluster");
export const dgram = (
  typeof window.cep !== "undefined" ? require("node:dgram") : {}
) as typeof import("dgram");
export const dns = (
  typeof window.cep !== "undefined" ? require("node:dns") : {}
) as typeof import("dns");
export const domain = (
  typeof window.cep !== "undefined" ? require("node:domain") : {}
) as typeof import("domain");
export const events = (
  typeof window.cep !== "undefined" ? require("node:events") : {}
) as typeof import("events");
export const fs = (
  typeof window.cep !== "undefined" ? require("node:fs") : {}
) as typeof import("fs");
export const http = (
  typeof window.cep !== "undefined" ? require("node:http") : {}
) as typeof import("http");
export const https = (
  typeof window.cep !== "undefined" ? require("node:https") : {}
) as typeof import("https");
export const net = (
  typeof window.cep !== "undefined" ? require("node:net") : {}
) as typeof import("net");
export const os = (
  typeof window.cep !== "undefined" ? require("node:os") : {}
) as typeof import("os");
export const path = (
  typeof window.cep !== "undefined" ? require("node:path") : {}
) as typeof import("path");
export const punycode = (
  typeof window.cep !== "undefined" ? require("node:punycode") : {}
) as typeof import("punycode");
export const querystring = (
  typeof window.cep !== "undefined" ? require("node:querystring") : {}
) as typeof import("querystring");
export const readline = (
  typeof window.cep !== "undefined" ? require("node:readline") : {}
) as typeof import("readline");
export const stream = (
  typeof window.cep !== "undefined" ? require("node:stream") : {}
) as typeof import("stream");
export const string_decoder = (
  typeof window.cep !== "undefined" ? require("node:string_decoder") : {}
) as typeof import("string_decoder");
export const timers = (
  typeof window.cep !== "undefined" ? require("node:timers") : {}
) as typeof import("timers");
export const tls = (
  typeof window.cep !== "undefined" ? require("node:tls") : {}
) as typeof import("tls");
export const tty = (
  typeof window.cep !== "undefined" ? require("node:tty") : {}
) as typeof import("tty");
export const url = (
  typeof window.cep !== "undefined" ? require("node:url") : {}
) as typeof import("url");
export const util = (
  typeof window.cep !== "undefined" ? require("node:util") : {}
) as typeof import("util");
export const v8 = (
  typeof window.cep !== "undefined" ? require("node:v8") : {}
) as typeof import("v8");
export const vm = (
  typeof window.cep !== "undefined" ? require("node:vm") : {}
) as typeof import("vm");
export const zlib = (
  typeof window.cep !== "undefined" ? require("node:zlib") : {}
) as typeof import("zlib");
