import axios from "axios";

export const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://aquapalhada-api.onrender.com"
export const API_URL = `${backendUrl}/api`;

export const absoluteUrl = (u) =>
  !u ? u : u.startsWith("http") || u.startsWith("data:") ? u : `${backendUrl}${u}`;

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Algo deu errado. Tente novamente.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const formatBRL = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

export default api;
