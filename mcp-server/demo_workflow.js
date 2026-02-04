const { spawn } = require("child_process");
const path = require("path");

const serverPath = path.resolve(__dirname, "dist/index.js");
const serverProcess = spawn("node", [serverPath], {
    stdio: ["pipe", "pipe", process.stderr],
});

let buffer = "";
let requests = [];
let currentRequestId = 1;

// Helper to send a request
function callTool(name, args) {
    return new Promise((resolve, reject) => {
        const id = currentRequestId++;
        const request = {
            jsonrpc: "2.0",
            id: id,
            method: "tools/call",
            params: {
                name: name,
                arguments: args
            }
        };

        requests[id] = { resolve, reject };
        serverProcess.stdin.write(JSON.stringify(request) + "\n");
    });
}

// Handle server responses
serverProcess.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const message = JSON.parse(line);
            // console.log("Debug Received:", JSON.stringify(message).substring(0, 100) + "...");

            if (message.id && requests[message.id]) {
                if (message.error) {
                    requests[message.id].reject(message.error);
                } else {
                    requests[message.id].resolve(message.result);
                }
                delete requests[message.id];
            }
        } catch (e) {
            //   console.error("Failed to parse JSON:", line);
        }
    }
});

// Main workflow
async function runDemo() {
    console.log("=== Starting Combined Workflow Demo ===");

    // Wait a bit for initialization (skipping formal handshake for this simple demo hack)
    await new Promise(r => setTimeout(r, 1000));

    try {
        // Step 1: Stitch - Create Project
        console.log("\n1. [Stitch] Creating UI Project...");
        const stitchProj = await callTool("stitch_create_project", {
            title: "Summer Campaign 2026"
        });
        console.log("   -> " + stitchProj.content[0].text);

        // Step 2: Stitch - Generate UI Screen (Mock HTML)
        console.log("\n2. [Stitch] Designing Component Layout...");
        const stitchScreen = await callTool("stitch_generate_screen", {
            description: "A promotional card with a hero image, title 'Summer Vibes', and a 'Book Now' button",
            output_path: path.resolve(__dirname, "../src/components/SummerPromo_Layout.html")
        });
        console.log("   -> " + stitchScreen.content[0].text);

        // Step 3: Jules - Generate Code (Astro Component)
        console.log("\n3. [Jules] Generating Astro Component Logic...");
        const julesCode = await callTool("jules_generate_code", {
            prompt: "Astro component for Summer Promo that accepts title and discount props",
            language: "typescript",
            output_path: path.resolve(__dirname, "../src/components/SummerPromo.astro")
        });
        console.log("   -> " + julesCode.content[0].text);

        // Step 4: Banana - Generate Image
        console.log("\n4. [Banana] Generating Campaign Background Image...");
        const bananaImage = await callTool("banana_generate_image", {
            prompt: "Tropical beach sunset with cocktails and palm trees luxury spa",
            output_path: path.resolve(__dirname, "../public/images/summer-campaign-bg.jpg")
        });
        console.log("   -> " + bananaImage.content[0].text);

        console.log("\n=== Workflow Completed Successfully! ===");
        process.exit(0);

    } catch (error) {
        console.error("Workflow failed:", error);
        process.exit(1);
    }
}

runDemo();
