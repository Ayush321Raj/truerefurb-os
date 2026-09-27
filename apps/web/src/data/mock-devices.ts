import { RefurbMetrics } from '@truerefurb/shared-types';
import { INITIAL_DEVICE_MASTER } from './mock-device-master';

export const INITIAL_DEVICES = INITIAL_DEVICE_MASTER;

export const INITIAL_METRICS: RefurbMetrics = {
  totalUnitsInPipeline: 1428,
  avgTurnaroundHours: 19.4,
  yieldRatePercent: 94.8,
  readyInventoryValue: 428950,
  activeWorkOrders: 86,
  reworkRatePercent: 2.1,
  gradeDistribution: {
    GRADE_A_PLUS: 412,
    GRADE_A: 598,
    GRADE_B: 284,
    GRADE_C: 98,
    GRADE_D: 24,
    PARTS_ONLY: 12
  },
  stageBreakdown: {
    INTAKE: 182,
    DIAGNOSTICS: 245,
    REPAIR_BENCH: 142,
    CLEANING_POLISH: 110,
    QA_INSPECTION: 95,
    PACKAGING: 78,
    READY_FOR_SALE: 576,
    LISTED: 410,
    SOLD: 1890,
    RETURNED: 32
  }
};
