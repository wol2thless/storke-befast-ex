import https from "node:https";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig();
  const appointmentUrl = config.appointmentApiUrl;
  if (!appointmentUrl) return { success: false, message: "Appointment API not configured" };

  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
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
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success: false, message: data }); }
      });
    });
    req.on("error", (e) => resolve({ success: false, message: e.message }));
    req.write(postData);
    req.end();
  });
});
