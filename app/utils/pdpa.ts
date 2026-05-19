export function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return "XXX-XXX-XXXX";
  const clean = phoneNumber.replace(/[^0-9]/g, "");
  if (clean.length < 5) return "XXX-XXX-XXXX";
  if (clean.length === 10) return `${clean.slice(0, 3)}-XXX-XX${clean.slice(8)}`;
  if (clean.length === 9) return `${clean.slice(0, 2)}-XXX-XX${clean.slice(7)}`;
  return `${clean.slice(0, 3)}-XXX-XX${clean.slice(-2)}`;
}

export function formatCid(cid: string, mask = true): string {
  if (!cid || cid.length !== 13) return cid || "-";
  if (mask) return `${cid[0]} ${cid.slice(1, 5)} XXXXX ${cid.slice(10, 12)} ${cid[12]}`;
  return `${cid[0]} ${cid.slice(1, 5)} ${cid.slice(5, 10)} ${cid.slice(10, 12)} ${cid[12]}`;
}

export function getAge(birthdate: string): string {
  if (!birthdate) return "-";
  const d = new Date(birthdate);
  if (isNaN(d.getTime())) return "-";
  return String(new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970);
}
