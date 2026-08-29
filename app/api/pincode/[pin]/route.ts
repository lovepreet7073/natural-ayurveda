import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Looks a PIN code up against India Post and returns the district, state and the
 * post offices that serve it.
 *
 * A wrong PIN on a cash-on-delivery order means a parcel that never arrives and
 * is never paid for, so it is worth checking while the customer is still on the
 * page. Proxied rather than called from the browser so the upstream shape stays
 * in one place and responses can be cached — PIN data changes about never.
 */

const UPSTREAM = "https://api.postalpincode.in/pincode";
const CACHE_SECONDS = 60 * 60 * 24 * 30;

type ApiError = { code: string; message: string };

const fail = (status: number, code: string, message: string) =>
  NextResponse.json<{ error: ApiError }>({ error: { code, message } }, { status });

type UpstreamOffice = {
  Name?: unknown;
  BranchType?: unknown;
  District?: unknown;
  State?: unknown;
};

type UpstreamResult = {
  Status?: unknown;
  PostOffice?: unknown;
};

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pin: string }> }
): Promise<NextResponse> {
  const { pin } = await params;

  if (!/^\d{6}$/.test(pin)) {
    return fail(400, "INVALID_PIN", "A PIN code is 6 digits");
  }

  let payload: unknown;
  try {
    const res = await fetch(`${UPSTREAM}/${pin}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(7000),
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    payload = await res.json();
  } catch (err) {
    // Upstream being down must never stop someone ordering — the browser falls
    // back to letting them type the address themselves.
    console.error(`[pincode] ${pin} lookup failed:`, err);
    return fail(503, "LOOKUP_UNAVAILABLE", "Could not check the PIN code");
  }

  const result = (Array.isArray(payload) ? payload[0] : null) as UpstreamResult | null;
  const offices = Array.isArray(result?.PostOffice)
    ? (result.PostOffice as UpstreamOffice[])
    : [];

  if (asString(result?.Status) !== "Success" || offices.length === 0) {
    return fail(404, "PIN_NOT_FOUND", "This PIN code was not found");
  }

  const names = [...new Set(offices.map((o) => asString(o.Name)).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );

  return NextResponse.json({
    data: {
      pincode: pin,
      district: asString(offices[0].District),
      state: asString(offices[0].State),
      postOffices: names,
    },
  });
}
