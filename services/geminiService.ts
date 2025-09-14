import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import type { Costume, InstructionStep } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const costumeSchema = {
  type: Type.OBJECT,
  properties: {
    costumeName: {
      type: Type.STRING,
      description: "A short, creative name for the Halloween costume.",
    },
    description: {
      type: Type.STRING,
      description: "A brief, engaging description of the costume concept.",
    },
    materials: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: "An item needed to create the costume."
      },
      description: "A list of materials and items required to assemble the costume.",
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "A single, clear, high-level step in the assembly process. This will be used to generate a primary visual diagram.",
          },
          subSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "A detailed, specific action or tip related to the main instruction step."
            },
            description: "A list of 2-4 detailed sub-steps that break down the main instruction. Be specific with actions like 'cut', 'glue', 'paint', etc."
          }
        },
        required: ["text", "subSteps"],
      },
      description: "A list of step-by-step instructions for creating the costume. Should contain between 3 and 5 main steps.",
    },
    difficulty: {
      type: Type.STRING,
      enum: ['Easy', 'Medium', 'Hard'],
      description: "The estimated difficulty to create the costume."
    },
    estimatedCost: {
        type: Type.STRING,
        enum: ['$', '$$', '$$$'],
        description: "An estimated cost range for the materials. '$' for cheap, '$$' for moderate, '$$$' for expensive."
    }
  },
  required: ["costumeName", "description", "materials", "instructions", "difficulty", "estimatedCost"],
};

const systemPrompt = `You are a creative Halloween costume designer and a helpful assistant. First, you will generate a unique and imaginative Halloween costume idea based on the user's input. Provide a name, a description, a list of materials, step-by-step instructions with detailed sub-steps, an estimated difficulty ('Easy', 'Medium', or 'Hard'), and a cost estimate ('$', '$$', or '$$$'). The tone should be fun and spooky. The instructions should be clear, with each main step broken down into more detailed sub-steps. After providing the initial idea, you will help the user refine it based on their feedback. ALWAYS respond in the requested JSON format.`;

type CostumeBaseInstruction = { text: string; subSteps: string[] };
type CostumeBase = Omit<Costume, 'id' | 'instructions'> & { instructions: CostumeBaseInstruction[] };

const parseAndValidateResponse = (responseText: string): CostumeBase => {
  const jsonText = responseText.trim();
  try {
    return JSON.parse(jsonText) as CostumeBase;
  } catch (error) {
    console.error("Failed to parse Gemini response:", jsonText);
    throw new Error("The AI returned a malformed response. Please try again.");
  }
};

const generateInstructionImage = async (costumeName: string, stepText: string): Promise<string | null> => {
    try {
        const prompt = `A clear, simple visual diagram for a DIY Halloween costume instruction manual.
        Costume Name: "${costumeName}"
        Instruction Step: "${stepText}"
        Style: Clean line art, simple colors, easy to understand, on a plain white background, showing only the parts relevant to this step.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes; // Return raw base64
        }
        return null;
    } catch (error) {
        console.error(`Failed to generate base image for step: "${stepText}"`, error);
        return null;
    }
};

const addDetailToInstructionImage = async (
    baseImageBase64: string,
    costumeName: string,
    stepText: string
): Promise<string | null> => {
    try {
        const textPart = {
            text: `Using the provided image as a base, illustrate this next step for the "${costumeName}" costume: "${stepText}". Add the new elements to the existing image. Maintain the same simple, clean line art style on a plain white background.`
        };
        const imagePart = {
            inlineData: {
                data: baseImageBase64,
                mimeType: 'image/png',
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; // Return new raw base64
            }
        }
        return null;
    } catch (error) {
        console.error(`Failed to generate additive image for step: "${stepText}"`, error);
        return null;
    }
};


const assembleCostume = async(costumeBase: CostumeBase): Promise<Costume> => {
    const instructionsWithImages: InstructionStep[] = [];
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    let previousImageBase64: string | null = null;

    for (const step of costumeBase.instructions) {
        let currentImageBase64: string | null = null;
        if (previousImageBase64) {
            // We have a previous image, so we add to it.
            currentImageBase64 = await addDetailToInstructionImage(previousImageBase64, costumeBase.costumeName, step.text);
        } else {
            // This is the first step OR the previous step failed to produce an image. Generate a fresh image.
            currentImageBase64 = await generateInstructionImage(costumeBase.costumeName, step.text);
        }

        instructionsWithImages.push({
            ...step,
            imageUrl: currentImageBase64 ? `data:image/png;base64,${currentImageBase64}` : null,
        });

        // The image for the *next* step will be based on the image we just generated.
        // If it was null, the next step will also generate a fresh image, restarting the sequence.
        previousImageBase64 = currentImageBase64;

        await sleep(1000); // Wait for 1 second before the next API call to avoid rate-limiting.
    }

    return {
        ...costumeBase,
        id: crypto.randomUUID(),
        instructions: instructionsWithImages,
    };
}


const generateCostumeFromText = async (responseText: string): Promise<Costume> => {
    const costumeBase = parseAndValidateResponse(responseText);
    return assembleCostume(costumeBase);
}


export const startCostumeChat = async (
  imageBase64: string,
  mimeType: string,
  userPrompt: string
): Promise<{ costume: Costume; chat: Chat }> => {

  const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: costumeSchema,
        temperature: 0.8,
      },
  });

  const imagePart = {
    inlineData: { data: imageBase64, mimeType },
  };
  const textPart = {
    text: `Base the costume on the provided image. User preferences: "${userPrompt || 'No specific preferences, be creative!'}"`,
  };
  
  const response = await chat.sendMessage({ message: [imagePart, textPart] });
  const costume = await generateCostumeFromText(response.text);

  return { costume, chat };
};

export const refineCostume = async (
  chat: Chat,
  refinementPrompt: string,
  costumeName: string
): Promise<Costume> => {
  const response = await chat.sendMessage({
      message: `The user wants to refine the "${costumeName}" costume. Their request is: "${refinementPrompt}". Please generate a new, complete costume JSON object that incorporates this change.`,
  });
  return generateCostumeFromText(response.text);
}


export const generateRandomCostumeIdea = async(userPrompt: string): Promise<Costume> => {
    const textPart = {
        text: `Generate a random costume idea. Do NOT ask for an image. User preferences: "${userPrompt || 'No specific preferences, be creative!'}"`
    };
    
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart] },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: costumeSchema,
          temperature: 0.8,
        },
    });
    const costumeBase = parseAndValidateResponse(textResponse.text);
    return assembleCostume(costumeBase);
}

export const searchCostumeIdeas = async (userPrompt: string): Promise<Costume[]> => {
    const textPart = {
        text: `Based on the user's request, generate a list of 5 distinct and creative costume ideas. User's request: "${userPrompt}"`
    };

    const searchSchema = {
        type: Type.ARRAY,
        items: costumeSchema,
        description: "A list of 5 distinct costume ideas."
    };

    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart] },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: searchSchema,
          temperature: 0.8,
        },
    });
    
    const costumeBases = JSON.parse(textResponse.text.trim()) as CostumeBase[];
    if (!Array.isArray(costumeBases)) {
        console.error("Expected an array of costumes, but got:", costumeBases);
        throw new Error("The AI did not return a list of costumes.");
    }

    const fullCostumes: Costume[] = [];
    for (const base of costumeBases) {
        // Process each costume sequentially to avoid overwhelming the image generation API
        const fullCostume = await assembleCostume(base);
        fullCostumes.push(fullCostume);
    }

    return fullCostumes;
}