import axios from "axios";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const client = axios.create({
  baseURL: API_BASE,
});
