import type { PasswordType } from "../types/password.types";

export const generatePasswordNumber = (type: PasswordType, sequence: number): string => {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const sq = sequence.toString().padStart(2, '0');
  return `${yy}${mm}${dd}-${type}${sq}`;
};