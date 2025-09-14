export interface InstructionStep {
  text: string;
  imageUrl: string | null;
  subSteps: string[];
}

export interface Costume {
  id: string;
  costumeName:string;
  description: string;
  materials: string[];
  instructions: InstructionStep[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedCost: '$' | '$$' | '$$$';
}
