const sanitizeBaseUrl = (url?: string) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

const ensureLeadingSlash = (value: string) => {
  return value.startsWith("/") ? value : `/${value}`;
};

const stripV1Prefix = (path: string) => {
  if (path === "/v1") return "";
  return path.startsWith("/v1/") ? path.slice(3) : path;
};

export const getApiBaseUrl = () => {
  return sanitizeBaseUrl(
    process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000",
  );
};

export const getApiV1BaseUrl = () => {
  return `${getApiBaseUrl()}/v1`;
};

export const getApiV1Url = (path: string) => {
  const normalized = ensureLeadingSlash(stripV1Prefix(path));
  return `${getApiV1BaseUrl()}${normalized}`;
};
