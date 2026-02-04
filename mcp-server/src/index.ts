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

// --- Mock Implementations ---

// 1. Banana: Image Generation (Mock: Copies placeholder)
const bananaGenerateImageHandler = async (args: any) => {
    const { prompt, output_path } = args;
    console.error(`[Banana] Generating image for prompt: "${prompt}"`);

    // Ensure directory exists
    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Determine a placeholder source based on prompt keywords (very simple logic)
    let sourceImage = "blog-placeholder-1.jpg";
    if (prompt.toLowerCase().includes("food") || prompt.toLowerCase().includes("chef")) {
        sourceImage = "blog-placeholder-2.jpg";
    } else if (prompt.toLowerCase().includes("room") || prompt.toLowerCase().includes("suite")) {
        sourceImage = "blog-placeholder-3.jpg";
    } else if (prompt.toLowerCase().includes("spa")) {
        sourceImage = "blog-placeholder-4.jpg";
    } else if (prompt.toLowerCase().includes("lobby") || prompt.toLowerCase().includes("exterior")) {
        sourceImage = "blog-placeholder-5.jpg";
    }

    // Assuming we run from d:\blog\blog\mcp-server, source is ../src/assets/
    const sourcePath = path.resolve(__dirname, "../../src/assets", sourceImage);

    try {
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, output_path);
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully generated image at ${output_path} (mocked using ${sourceImage})`,
                    },
                ],
            };
        } else {
            // Fallback if source assets aren't found relative to where we run
            // Just write a dummy text file if image missing, or try an absolute path if known? 
            // For now, let's just write a dummy file to not break the flow.
            fs.writeFileSync(output_path, "Mock Image Content");
            return {
                content: [
                    {
                        type: "text",
                        text: `Generated mock placeholder at ${output_path} (source asset not found, created dummy file)`,
                    },
                ],
            };
        }
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error generating image: ${error.message}`,
                },
            ],
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
    console.error(`[Stitch] Generating screen for: "${description}"`);

    const dir = path.dirname(output_path);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const mockHtml = `
    <!-- Mock Generated Component for: ${description} -->
    <div class="stitch-generated">
        <h1>Generated UI</h1>
        <p>${description}</p>
        <button>Click Me</button>
    </div>
    `;

    fs.writeFileSync(output_path, mockHtml);

    return {
        content: [
            {
                type: "text",
                text: `Generated screen at ${output_path}`,
            },
        ],
    };
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
