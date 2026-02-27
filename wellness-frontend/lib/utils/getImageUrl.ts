import { getApiBaseUrl } from "./api";

// replicate logic from HeroCarousel and hero-section
export const getImageUrl = (url?: string) => {
  // use an asset that actually exists in public/
  // older placeholder.png was missing which caused Next/Image to
  // blow up when it tried to load the invalid URL.
  if (!url) return "/placeholder-product.svg";

  // handle base64
  if (url.startsWith("data:")) return url;

  let finalUrl = url;
  if (!finalUrl.startsWith("http")) {
    // prefix with api base if relative
    const api = getApiBaseUrl();
    finalUrl = finalUrl.startsWith("/")
      ? `${api}${finalUrl}`
      : `${api}/${finalUrl}`;
  }
  try {
    const u = new URL(finalUrl);
    u.pathname = u.pathname
      .split("/")
      .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
      .join("/");
    return u.toString();
  } catch {
    return encodeURI(finalUrl);
  }
};
