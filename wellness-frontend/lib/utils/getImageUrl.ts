import { getApiBaseUrl } from "./api";

// replicate logic from HeroCarousel and hero-section
export const getImageUrl = (url?: string) => {
  // use an asset that actually exists in public/
  // older placeholder.png was missing which caused Next/Image to
  // blow up when it tried to load the invalid URL.
  if (!url) return "/placeholder-product.svg";

  // handle base64 properly
  if (url.startsWith("data:")) return url;

  // if raw base64 was sent without the prefix, detect and format it
  if (url.startsWith("iVBORw0K")) return `data:image/png;base64,${url}`;
  if (url.startsWith("/9j/")) return `data:image/jpeg;base64,${url}`;
  if (url.startsWith("R0lGOD")) return `data:image/gif;base64,${url}`;
  if (url.startsWith("UklGR")) return `data:image/webp;base64,${url}`;

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
