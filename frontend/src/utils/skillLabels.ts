export const skillLabels = {
  skill1: "Creatividad",
  skill2: "Planificación y análisis",
  skill3: "Capacidad de trabajo",
  skill4: "Comunicación",
} as const;

export type SkillKey = keyof typeof skillLabels;
