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

// Configuration
const config: Config = {
  vlcHttpPort: 42339,
  vlcHttpPassword: "hrhqhrqhqrh", // Replace with your actual password
  goodFolder: "good",
};

export default config; 