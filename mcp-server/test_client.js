const { spawn } = require("child_process");
const path = require("path");

const serverPath = path.resolve(__dirname, "dist/index.js");
const serverProcess = spawn("node", [serverPath], {
    stdio: ["pipe", "pipe", process.stderr],
});

let buffer = "";

serverProcess.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // Keep the last incomplete line

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const message = JSON.parse(line);
            console.log("Received:", JSON.stringify(message, null, 2));

            if (message.result && message.result.tools) {
                // If we received the list of tools, let's call one
                const bananaTool = message.result.tools.find(t => t.name === "banana_generate_image");
                if (bananaTool) {
                    console.log("\nCalling banana_generate_image...");
                    const request = {
                        jsonrpc: "2.0",
                        id: 2,
                        method: "tools/call",
                        params: {
                            name: "banana_generate_image",
                            arguments: {
                                prompt: "A luxury hotel lobby with gold accents",
                                output_path: path.resolve(__dirname, "../public/images/test-lobby.jpg")
                            }
                        }
                    };
                    serverProcess.stdin.write(JSON.stringify(request) + "\n");
                }
            } else if (message.id === 2) {
                console.log("\nTool call successful!");
                process.exit(0);
            }

        } catch (e) {
            console.error("Failed to parse JSON:", line);
        }
    }
});

// Send initialize request
const initRequest = {
    jsonrpc: "2.0",
    id: 0,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
    },
};

console.log("Sending initialize...");
serverProcess.stdin.write(JSON.stringify(initRequest) + "\n");

// Send initialized notification and list tools
setTimeout(() => {
    serverProcess.stdin.write(JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized"
    }) + "\n");

    console.log("Sending tools/list...");
    serverProcess.stdin.write(JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list"
    }) + "\n");
}, 500);
