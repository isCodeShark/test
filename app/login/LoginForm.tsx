"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const initial: LoginState = { status: "idle" };

export function LoginForm({ next, error }: { next: string; error?: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, initial);

  if (state.status === "sent") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-medium">Check your email</p>
        <p className="mt-1">
          We sent a sign-in link to <span className="font-medium">{state.email}</span>. Open it on
          this device to continue.
        </p>
      </div>
    );
  }

  const message = state.status === "error" ? state.message : error;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-rose-700 focus:outline-none focus:ring-1 focus:ring-rose-700"
        />
      </div>
      {message ? (
        <p role="alert" className="text-sm text-red-700">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-60"
      >
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </button>
      <p className="text-xs text-stone-500">
        No password needed. We&apos;ll email you a one-time link.
      </p>
    </form>
  );
}
