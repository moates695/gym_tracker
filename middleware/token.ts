import { jwtDecode } from "jwt-decode";

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: {expiry: number } = jwtDecode(token);
    if (decoded.expiry === undefined) return true;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    return decoded.expiry < currentTimestamp;
  } catch (error) {
    console.error(error);
    return true;
  }
};

export function isTokenHalfExpired(token: string): boolean {
  try {
    const decoded: {expiry: number; days: number; minutes: number } = jwtDecode(token);
    if (decoded.expiry === undefined) return true;

    const totalExpirySeconds = (decoded.days * 24 * 60 * 60) + (decoded.minutes * 60);
    const halfExpiryTime = decoded.expiry - (totalExpirySeconds / 2);

    const currentTimestamp = Math.floor(Date.now() / 1000);
    return halfExpiryTime <= currentTimestamp;
    
  } catch (error) {
    console.error(error);
    return true;
  }
};