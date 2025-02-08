// Configuration interface
export interface Config {
  vlcHttpPort: number;
  vlcHttpPassword: string;
  goodFolder: string;
}

// VLC status response interface
export interface VlcPlaylist {
  type: string;
  ro: string;
  name: string;
  id: string;
  children: VlcNode[];
}

export interface VlcNode {
  type: string;
  ro: string;
  name: string;
  id: string;
  uri?: string;
  current?: string; // Indicates if this is the current item
  duration?: number;
  children?: VlcNode[];
}

// Add this interface after the other interfaces
export interface VlcStatus {
  random: boolean;
  // other fields exist but we don't need them
}

// Parse command line arguments
const args = Deno.args;
let shouldDelete = false;
let shouldMove = false;

// Process arguments
for (const arg of args) {
  if (arg === "-d" || arg === "--delete") {
    shouldDelete = true;
  } else if (arg === "-m" || arg === "--move") {
    shouldMove = true;
  }
}

// Validate arguments
if (shouldDelete && shouldMove) {
  console.error("Error: Cannot use both delete and move options simultaneously");
  Deno.exit(1);
}

if (!shouldDelete && !shouldMove) {
  console.error("Error: Must specify either --delete (-d) or --move (-m)");
  Deno.exit(1);
}

// Configuration
const config: Config = {
  vlcHttpPort: 42339,
  vlcHttpPassword: "hrhqhrqhqrh", // Replace with your actual password
  goodFolder: "good",
};

export { shouldDelete, shouldMove };
export default config; 