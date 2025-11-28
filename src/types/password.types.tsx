export type PasswordType = 'SP' | 'SG' | 'SE';

export interface Password {
  id: string;
  type: PasswordType;
  number: string;
  issuedAt: Date;
  attendedAt?: Date;
  counter?: number;
  status: 'waiting' | 'called' | 'attended' | 'discarded';
}