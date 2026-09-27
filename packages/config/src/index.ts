export * from './permissions-matrix';

export const GRADING_TIERS = {
  GRADE_A_PLUS: {
    label: 'Grade A+ (Pristine)',
    badgeColor: '#10b981',
    description: 'Flawless cosmetic condition. Zero micro-abrasions under 500 lux, battery health >= 90%.',
    resalePremium: 1.15,
  },
  GRADE_A: {
    label: 'Grade A (Excellent)',
    badgeColor: '#06b6d4',
    description: 'Minor micro-scratches imperceptible at 30cm with display on, battery health >= 85%.',
    resalePremium: 1.0,
  },
  GRADE_B: {
    label: 'Grade B (Good)',
    badgeColor: '#f59e0b',
    description: 'Noticeable minor signs of wear or bezel scratches, screen 100% intact.',
    resalePremium: 0.88,
  },
  GRADE_C: {
    label: 'Grade C (Fair)',
    badgeColor: '#f97316',
    description: 'Moderate cosmetic blemishes, casing scuffs, full hardware functionality.',
    resalePremium: 0.72,
  },
  GRADE_D: {
    label: 'Grade D (Clearance)',
    badgeColor: '#ef4444',
    description: 'Heavy cosmetic wear, suitable for budget/fleet operations.',
    resalePremium: 0.55,
  },
  PARTS_ONLY: {
    label: 'Parts / Harvest',
    badgeColor: '#64748b',
    description: 'Economically unviable repair; disassembled for OEM spare modules.',
    resalePremium: 0.3,
  },
} as const;

export const WORKFLOW_STAGES = [
  { id: 'INTAKE', label: 'Intake & Logging', step: 1, icon: 'PackageOpen' },
  { id: 'DIAGNOSTICS', label: 'Hardware Diagnostic', step: 2, icon: 'Cpu' },
  { id: 'REPAIR_BENCH', label: 'Repair & Soldering', step: 3, icon: 'Wrench' },
  { id: 'CLEANING_POLISH', label: 'Detailing & Polish', step: 4, icon: 'Sparkles' },
  { id: 'QA_INSPECTION', label: 'Quality Audit', step: 5, icon: 'CheckCircle' },
  { id: 'PACKAGING', label: 'Packaging & Kit', step: 6, icon: 'Box' },
  { id: 'READY_FOR_SALE', label: 'Ready for Sale', step: 7, icon: 'BadgeCheck' },
] as const;

export const APP_CONFIG = {
  appName: 'TrueRefurb OS',
  version: '3.0.0 Enterprise',
  defaultCurrency: 'USD',
  minBatteryHealthPass: 80,
  targetYieldRate: 92.0,
  dataScopeLevels: ['GLOBAL', 'TENANT', 'REGION', 'WAREHOUSE', 'DEPARTMENT', 'TEAM', 'ASSIGNED', 'OWN'] as const,
};
