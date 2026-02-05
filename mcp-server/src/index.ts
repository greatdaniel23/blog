import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

const server = new Server(
    {
        name: "hotel-blog-tools",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// --- Real API Implementations ---

// 1. Banana: Image Generation (Real API via Google Gemini Imagen)
const bananaGenerateImageHandler = async (args: any) => {
    const { prompt, output_path, aspect_ratio } = args;
    console.error(`[Banana] Generating REAL image via Gemini for: "${prompt}"`);

    // Ensure directory exists
    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Get API key from environment or use a default (for testing)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

    if (!apiKey) {
        return {
            content: [{ type: "text", text: "Error: GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set" }],
            isError: true,
        };
    }

    // Determine aspect ratio for Imagen
    let aspectRatioParam = "1:1";
    if (aspect_ratio === "9:16" || aspect_ratio === "16:9" || aspect_ratio === "4:3" || aspect_ratio === "3:4") {
        aspectRatioParam = aspect_ratio;
    } else if (aspect_ratio === "4:5") {
        aspectRatioParam = "3:4"; // Closest supported ratio
    }

    try {
        // Use Gemini 3 Pro Image model
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

        const requestBody = {
            contents: [{
                parts: [{ text: `Generate a high-quality image: ${prompt}` }]
            }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        };

        console.error(`[Banana] Calling Gemini 2.0 Flash Image API...`);
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned status ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        // Extract image from response - Gemini format
        const candidates = result.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const buffer = Buffer.from(imageData, "base64");
                    fs.writeFileSync(output_path, buffer);

                    console.error(`[Banana] Successfully saved image to ${output_path} (${buffer.length} bytes)`);
                    return {
                        content: [{ type: "text", text: `Successfully generated REAL image at ${output_path} (${buffer.length} bytes)` }],
                    };
                }
            }
        }
        throw new Error("No image data in API response: " + JSON.stringify(result).substring(0, 500));
    } catch (error: any) {
        console.error(`[Banana] Error: ${error.message}`);
        return {
            content: [{ type: "text", text: `Error generating image: ${error.message}` }],
            isError: true,
        };
    }
};

// 2. Stitch: UI/UX Design (Mock: Generates HTML templates)
const stitchCreateProjectHandler = async (args: any) => {
    const { title } = args;
    console.error(`[Stitch] Creating project: "${title}"`);
    return {
        content: [
            {
                type: "text",
                text: `Project "${title}" created with ID: stitch-proj-${Date.now()}`,
            },
        ],
    };
};

const stitchGenerateScreenHandler = async (args: any) => {
    const { description, output_path } = args;
    console.error(`[Stitch] Generating screen with text overlay for: "${description}"`);

    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

    if (!apiKey) {
        return {
            content: [{ type: "text", text: "Error: GEMINI_API_KEY environment variable not set" }],
            isError: true,
        };
    }

    try {
        // Use Gemini 3 Pro Image to generate a design with text
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

        // Parse the description to extract design instructions
        const prompt = `Create a professional Instagram post graphic with the following specifications:
${description}

Requirements:
- High contrast, easy to read text
- Professional social media design aesthetic
- 1080x1350 pixels (4:5 aspect ratio for Instagram)
- Text should be prominent and centered
- Use modern, clean typography`;

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        };

        console.error(`[Stitch] Calling Gemini API for text overlay design...`);
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned status ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        // Extract image from response
        const candidates = result.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    const imageData = part.inlineData.data;
                    const buffer = Buffer.from(imageData, "base64");
                    fs.writeFileSync(output_path, buffer);

                    console.error(`[Stitch] Successfully saved composed image to ${output_path} (${buffer.length} bytes)`);
                    return {
                        content: [{ type: "text", text: `Successfully generated composed image at ${output_path} (${buffer.length} bytes)` }],
                    };
                }
            }
        }
        throw new Error("No image data in API response: " + JSON.stringify(result).substring(0, 500));
    } catch (error: any) {
        console.error(`[Stitch] Error: ${error.message}`);
        return {
            content: [{ type: "text", text: `Error generating screen: ${error.message}` }],
            isError: true,
        };
    }
};

// 3. Jules: Code Generation (Mock: Generates Boilerplate)
const julesGenerateCodeHandler = async (args: any) => {
    const { prompt, language, output_path } = args;
    console.error(`[Jules] Generating ${language} code for: "${prompt}"`);

    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let mockCode = `// Generated Code for: ${prompt}\n\n`;
    if (language === "typescript" || language === "javascript") {
        mockCode += `export function generatedFunction() {\n  console.log("Jules generated this!");\n}`;
    } else {
        mockCode += `# Code for ${prompt}`;
    }

    fs.writeFileSync(output_path, mockCode);

    return {
        content: [
            {
                type: "text",
                text: `Generated code at ${output_path}`,
            },
        ],
    };
};

const julesCreateWorkerHandler = async (args: any) => {
    const { name } = args;
    console.error(`[Jules] Creating worker: "${name}"`);
    return {
        content: [
            {
                type: "text",
                text: `Worker "${name}" created successfully.`,
            },
        ],
    };
};


// --- Tool Registration ---

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "banana_generate_image",
                description: "Generate an image using Banana",
                inputSchema: zodToJsonSchema(
                    z.object({
                        prompt: z.string(),
                        output_path: z.string(),
                        aspect_ratio: z.string().optional(),
                    })
                ),
            },
            {
                name: "stitch_create_project",
                description: "Create a new UI design project in Stitch",
                inputSchema: zodToJsonSchema(
                    z.object({
                        title: z.string(),
                    })
                ),
            },
            {
                name: "stitch_generate_screen",
                description: "Generate a UI screen/component using Stitch",
                inputSchema: zodToJsonSchema(
                    z.object({
                        project_id: z.string().optional(),
                        description: z.string(),
                        output_path: z.string(),
                    })
                ),
            },
            {
                name: "jules_generate_code",
                description: "Generate code using Jules",
                inputSchema: zodToJsonSchema(
                    z.object({
                        prompt: z.string(),
                        language: z.string(),
                        output_path: z.string(),
                    })
                ),
            },
            {
                name: "jules_create_worker",
                description: "Create a Jules worker",
                inputSchema: zodToJsonSchema(
                    z.object({
                        name: z.string(),
                    })
                ),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
        case "banana_generate_image":
            return bananaGenerateImageHandler(args);
        case "stitch_create_project":
            return stitchCreateProjectHandler(args);
        case "stitch_generate_screen":
            return stitchGenerateScreenHandler(args);
        case "jules_generate_code":
            return julesGenerateCodeHandler(args);
        case "jules_create_worker":
            return julesCreateWorkerHandler(args);
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});

// Helper to convert Zod to JSON Schema (simplified for this specific use case)
function zodToJsonSchema(schema: z.ZodType<any>): any {
    // This is a minimal implementation. In production, use 'zod-to-json-schema' package or similar.
    // For this simple example, we'll manually construct it for strings/objects as used above
    // or just rely on a simple recursive parser if needed, 
    // BUT since we installed 'zod', we might as well use a library or just hardcode the schema structures 
    // if we don't want to add another dependency.
    // Actually, for robustness, let's use a simplified manual mapping here since we didn't install zod-to-json-schema.

    // Quick and dirty manual mapping for the known schemas above
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties: any = {};
        const required: string[] = [];

        for (const key in shape) {
            const field = shape[key];
            properties[key] = { type: "string" }; // All our inputs above are strings
            if (!field.isOptional()) {
                required.push(key);
            }
        }
        return {
            type: "object",
            properties,
            required
        };
    }
    return { type: "string" };
}

const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
