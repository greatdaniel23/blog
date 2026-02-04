# Hotel Blog MCP Server

This Node.js server implements the Model Context Protocol (MCP) to provide tools for the Hotel Blog deployment workflow.

## Tools Provided

### 1. Banana (Image Generation)
*   **Tool**: `banana_generate_image`
*   **Description**: Mocks image generation by copying placeholder images to the specified output path.
*   **Key Behavior**: Selects a placeholder image based on keywords in the prompt (e.g., "food", "room", "spa").

### 2. Stitch (UI Design)
*   **Tool**: `stitch_create_project`
*   **Description**: Simulates creating a UI design project.
*   **Tool**: `stitch_generate_screen`
*   **Description**: Generates specific UI components/screens as HTML files based on a description.

### 3. Jules (Code Generation)
*   **Tool**: `jules_generate_code`
*   **Description**: Generates boilerplate code (TypeScript/Astro) based on a prompt.
*   **Tool**: `jules_create_worker`
*   **Description**: Mocks the creation of a background worker.

## Setup & Usage

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build**:
    ```bash
    npm run build
    ```
    (Or `npx tsc`)

3.  **Run**:
    ```bash
    node dist/index.js
    ```
    The server communicates via `stdio`.

## Configuration

To use this with your MCP client (e.g., in `mcp_config.json`), add:

```json
{
  "mcpServers": {
    "hotel-blog-tools": {
      "command": "node",
      "args": ["/absolute/path/to/blog/mcp-server/dist/index.js"]
    }
  }
}
```
