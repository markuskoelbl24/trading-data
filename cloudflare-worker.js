/**
 * Kurs-Proxy fuer trading-data.html (Cloudflare Worker, kostenloser Plan reicht).
 *
 * Aufruf:  https://<dein-worker>.workers.dev/?url=<Yahoo-URL, encodeURIComponent>
 * In der App unter Einstellungen -> "Eigener Kurs-Proxy" eintragen:
 *          https://<dein-worker>.workers.dev/?url=
 *
 * Durchgelassen wird ausschliesslich query1/query2.finance.yahoo.com — der Worker
 * ist damit kein offener Proxy, den Fremde fuer beliebige Ziele missbrauchen koennen.
 *
 * Warum mehr als ein schlichtes fetch(): Yahoo weist Anfragen aus Rechenzentren
 * ohne Session-Cookie zunehmend mit 401/403/429 ab. Faellt das auf, holt der Worker
 * einmal Cookie + Crumb und wiederholt die Anfrage damit. Beides bleibt im Speicher
 * der Instanz, wird also nur alle paar Stunden neu besorgt.
 */
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
           "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" };
const ALLOWED = /^https:\/\/query[12]\.finance\.yahoo\.com\//;
const SESSION_TTL = 6 * 60 * 60 * 1000;

let session = { cookie: "", crumb: "", ts: 0 };

async function getSession() {
  if (session.cookie && Date.now() - session.ts < SESSION_TTL) return session;
  const r = await fetch("https://fc.yahoo.com/", { headers: { "User-Agent": UA } });
  const raw = r.headers.getSetCookie ? r.headers.getSetCookie() : [r.headers.get("set-cookie") || ""];
  const cookie = raw.map((c) => c.split(";")[0]).filter(Boolean).join("; ");
  let crumb = "";
  if (cookie) {
    const c = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb",
      { headers: { "User-Agent": UA, cookie } });
    if (c.ok) crumb = (await c.text()).trim();
  }
  session = { cookie, crumb, ts: Date.now() };
  return session;
}

function withCrumb(target, crumb) {
  if (!crumb) return target;
  const u = new URL(target);
  if (!u.searchParams.has("crumb")) u.searchParams.set("crumb", crumb);
  return u.toString();
}

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    const target = new URL(req.url).searchParams.get("url");
    if (!ALLOWED.test(target || ""))
      return new Response("bad url - erlaubt ist nur query1/query2.finance.yahoo.com",
        { status: 400, headers: CORS });

    const headers = {
      "User-Agent": UA,
      "Accept": "application/json,text/plain,*/*",
      "Accept-Language": "en-US,en;q=0.9",
    };

    let r = await fetch(target, { headers });                 // erst schlicht - klappt meistens
    if (r.status === 401 || r.status === 403 || r.status === 429) {
      const s = await getSession();                           // abgewiesen -> mit Cookie/Crumb nochmal
      if (s.cookie) r = await fetch(withCrumb(target, s.crumb), { headers: { ...headers, cookie: s.cookie } });
    }

    // Status und Text der Gegenstelle unveraendert durchreichen - so zeigt der
    // Proxy-Test in der App, ob Yahoo drosselt oder der Ticker nicht existiert.
    return new Response(r.body, {
      status: r.status,
      headers: {
        ...CORS,
        "Content-Type": r.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  },
};
