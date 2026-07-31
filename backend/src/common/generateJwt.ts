import jwt, { SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  role: string;
  clinicId: string | null;
}
function generateJwt(
  payload: TokenPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"],
) {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

export default generateJwt;
