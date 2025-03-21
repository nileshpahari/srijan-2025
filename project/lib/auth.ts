import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

// Convert your secret to Uint8Array for jose library
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "d6640b808edb169ab438614826f6282b5362c3179bd36f2d0cbe860527c20ec0"
);

export async function signJwtToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error("Error signing JWT token:", error);
    throw error;
  }
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("Error verifying JWT token:", error);
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyJwtToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) return null;

  try {
    const payload = await verifyJwtToken(token);
    return payload;
  } catch (error) {
    return null;
  }
}
