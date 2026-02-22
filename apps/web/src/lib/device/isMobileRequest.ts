export function isMobileRequest(ua: string | null, chMobile: string | null) {
  if (chMobile === "?1") return true;
  if (chMobile === "?0") return false;

  const s = (ua ?? "").toLowerCase();
  
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(s);
}