// お問い合わせフォームの送信を受け取り、外部メールAPI（Resend）経由で
// 運営者宛にメールを送信するEdge Function。
//
// 必要な環境変数（`supabase secrets set` で設定。ローカル開発時は
// `supabase/functions/.env` 等に置いてください。リポジトリにはコミットしないこと）:
//   RESEND_API_KEY   - Resendで発行したAPIキー
//   CONTACT_TO_EMAIL - 送信先（運営者）のメールアドレス
//   ALLOWED_ORIGIN   - CORSで許可するオリジン（未設定時は https://pontalelab.com）
//
// デプロイ: supabase functions deploy contact-form
//
// 送信元アドレスについて：Resendの `onboarding@resend.dev` を使用しており、
// 独自ドメインの検証は行っていません。この場合Resend側の制約により、
// CONTACT_TO_EMAIL 宛（＝Resendアカウント登録時のメールアドレス）にしか
// 送信できませんが、運営者自身が受信するお問い合わせフォームの用途では
// この制約はそのまま要件に合致します。将来的に見た目の信頼性を上げたい
// 場合は、独自ドメインをResend側で検証した上で `from` を差し替えてください。

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://pontalelab.com";

const MAX_LENGTHS = {
  name: 100,
  email: 200,
  type: 50,
  message: 5000,
};

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function isValidEmail(value: string): boolean {
  // 厳密なRFC準拠のバリデーションではなく、明らかな入力ミスをはじくための簡易チェック
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405, origin);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400, origin);
  }

  // ハニーポット：人間には見えない項目が埋まっていたらボットとみなし、
  // 何もせず成功したふりを返す（ボットに検知されたことを知らせない）
  const honeypot = typeof payload.website === "string" ? payload.website.trim() : "";
  if (honeypot !== "") {
    return jsonResponse({ ok: true }, 200, origin);
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const type = typeof payload.type === "string" ? payload.type.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || !email || !message) {
    return jsonResponse({ ok: false, error: "missing_fields" }, 400, origin);
  }
  if (!isValidEmail(email)) {
    return jsonResponse({ ok: false, error: "invalid_email" }, 400, origin);
  }
  if (
    name.length > MAX_LENGTHS.name ||
    email.length > MAX_LENGTHS.email ||
    type.length > MAX_LENGTHS.type ||
    message.length > MAX_LENGTHS.message
  ) {
    return jsonResponse({ ok: false, error: "field_too_long" }, 400, origin);
  }

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("CONTACT_TO_EMAIL");
  if (!resendApiKey || !toEmail) {
    console.error("RESEND_API_KEY or CONTACT_TO_EMAIL is not configured");
    return jsonResponse({ ok: false, error: "server_misconfigured" }, 500, origin);
  }

  const subject = `[Pontalelab] お問い合わせ (${type || "種別未選択"})`;
  const text = `お名前: ${name}\nメール: ${email}\n種別: ${type || "(未選択)"}\n\n${message}`;

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pontalelab <onboarding@resend.dev>",
        to: [toEmail],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errBody);
      return jsonResponse({ ok: false, error: "email_send_failed" }, 502, origin);
    }
  } catch (err) {
    console.error("Failed to call Resend API:", err);
    return jsonResponse({ ok: false, error: "email_send_failed" }, 502, origin);
  }

  return jsonResponse({ ok: true }, 200, origin);
});
