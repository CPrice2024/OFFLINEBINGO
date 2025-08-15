import crypto from "crypto";

export const signBalance = (balance) => {
  return crypto
    .createHmac("sha256", process.env.BALANCE_SECRET_KEY)
    .update(String(balance))
    .digest("hex");
};
