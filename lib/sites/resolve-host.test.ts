import { describe, expect, it } from "vitest";
import { resolveHost } from "./resolve-host";

const env = { appHosts: ["invites.example.com"], rootDomain: "example.com" };

describe("resolveHost", () => {
  it("treats a missing host as the app", () => {
    expect(resolveHost(null, env)).toEqual({ kind: "app" });
    expect(resolveHost("", env)).toEqual({ kind: "app" });
  });

  it("treats localhost and vercel previews as the app", () => {
    expect(resolveHost("localhost:3000", env)).toEqual({ kind: "app" });
    expect(resolveHost("my-app-git-main.vercel.app", env)).toEqual({ kind: "app" });
  });

  it("matches configured app hosts, ignoring case and port", () => {
    expect(resolveHost("Invites.Example.com:443", env)).toEqual({ kind: "app" });
  });

  it("maps {slug}.{root} to a subdomain site", () => {
    expect(resolveHost("rafid-and-shanice.example.com", env)).toEqual({
      kind: "subdomain",
      slug: "rafid-and-shanice",
    });
  });

  it("treats the bare root and www as the app", () => {
    expect(resolveHost("example.com", env)).toEqual({ kind: "app" });
    expect(resolveHost("www.example.com", env)).toEqual({ kind: "app" });
  });

  it("does not treat reserved or nested labels as sites", () => {
    expect(resolveHost("dashboard.example.com", env)).toEqual({ kind: "app" });
    expect(resolveHost("a.b.example.com", env)).toEqual({ kind: "app" });
  });

  it("flags unknown hosts as custom domains", () => {
    expect(resolveHost("rafidandshanice.com", env)).toEqual({
      kind: "custom",
      host: "rafidandshanice.com",
    });
  });

  it("never yields subdomains when no root domain is configured", () => {
    expect(resolveHost("x.example.com", { appHosts: [], rootDomain: null })).toEqual({
      kind: "custom",
      host: "x.example.com",
    });
  });

  it("uses the first host when a list was forwarded", () => {
    expect(resolveHost("rafid.example.com, proxy.internal", env)).toEqual({
      kind: "subdomain",
      slug: "rafid",
    });
  });
});
