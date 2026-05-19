import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

function rawPost(urlStr: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === "https:";
    const options = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : isHttps ? 443 : 80,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
      rejectUnauthorized: false, // hospital internal cert อาจ self-signed
    };

    const lib = isHttps ? https : http;
    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { code, redirect_uri } = body;

  if (!code) {
    throw createError({ statusCode: 400, message: "Missing required field: code" });
  }

  const config = useRuntimeConfig();
  const apiUrl = config.thaidApiUrl;

  const formBody = new URLSearchParams();
  formBody.append("code", code);
  formBody.append("redirect_uri", redirect_uri || "");

  let rawText = "";
  let fetchError: string | null = null;

  try {
    rawText = await rawPost(apiUrl, formBody.toString());
    console.log("[thaid-verify] raw response:", rawText.slice(0, 500));
  } catch (err: unknown) {
    fetchError = err instanceof Error ? err.message : String(err);
    console.error("[thaid-verify] fetch error:", fetchError);
    return { success: false, message: fetchError, responseData: null, fetchError };
  }

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    console.error("[thaid-verify] response is not JSON:", rawText.slice(0, 200));
    return {
      success: false,
      message: "ThaiD endpoint ไม่ตอบกลับเป็น JSON",
      responseData: rawText.slice(0, 300),
      fetchError: null,
    };
  }

  if (parsed?.save_response && (parsed.save_response as { status?: string }).status === "success") {
    return {
      success: true,
      message: "Authentication successful",
      responseData: parsed,
    };
  }

  return {
    success: false,
    message: "ThaiD authentication failed",
    responseData: parsed,
    fetchError: null,
  };
});
