import https from "node:https";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const pid = String(query.pid || "");
  if (!pid) return { success: false, message: "Missing pid" };

  const config = useRuntimeConfig();
  const appointmentUrl = config.appointmentApiUrl;
  if (!appointmentUrl) return { success: false, message: "Appointment API not configured" };

  return new Promise((resolve) => {
    const postData = JSON.stringify({ pid });
    const url = new URL(appointmentUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(postData) },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            const sorted = parsed.sort((a, b) => {
              const toDate = (s: string) => {
                const [d, m, y] = s.split("/");
                return new Date(`${y}-${m}-${d}`).getTime();
              };
              return toDate(a.APP_DATE) - toDate(b.APP_DATE);
            });
            resolve({ success: true, data: sorted });
          } else {
            resolve({ success: true, data: [] });
          }
        } catch {
          resolve({ success: false, data: [] });
        }
      });
    });
    req.on("error", (e) => resolve({ success: false, message: e.message, data: [] }));
    req.write(postData);
    req.end();
  });
});
