export interface QueueStats {
  totalIssued: number;
  totalAttended: number;
  byType: {
    SP: { issued: number; attended: number };
    SG: { issued: number; attended: number };
    SE: { issued: number; attended: number };
  };
}