import config, { VlcPlaylist, VlcNode, VlcStatus } from "./config.ts";

// Export lastPlayedItemId
export let lastPlayedItemId: string | null = null;

// Export recentlyPlayedIds
export const recentlyPlayedIds: Set<string> = new Set();

// Function to log messages with timestamp
export function log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG] ${timestamp} - ${message}`);
  }
  
  // Function to decode URL-encoded string
  export function decodeUri(uri: string): string {
    return decodeURIComponent(uri.replace(/\+/g, " "));
  }
  
  // Function to get the currently playing media from VLC
  export async function getCurrentMedia(): Promise<string | null> {
    log("Fetching currently playing media from VLC HTTP API...");
  
    const response = await fetch(
      `http://localhost:${config.vlcHttpPort}/requests/playlist.json`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      },
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const playlist: VlcPlaylist = await response.json();
  
    // Check if the playlist has children
    if (!playlist.children || playlist.children.length === 0) {
      log("No items in the playlist.");
      return null; // Return null instead of throwing an error
    }
  
    // Find the currently playing media
    const currentMedia = playlist.children[0].children?.find((item: VlcNode) =>
      item.current === "current"
    );
  
    if (!currentMedia || !currentMedia.uri) {
      log("No media is currently playing.");
      return null; // Return null instead of throwing an error
    }
  
    // Store the ID of the current item before we advance
    lastPlayedItemId = currentMedia.id;
  
    log(`Current media URI: ${currentMedia.uri}`);
    return currentMedia.uri;
  }
  
  // Function to move file to good folder
  export async function moveFile(filePath: string): Promise<void> {
    const path = await import("https://deno.land/std@0.224.0/path/mod.ts");
  
    // Get directory and filename
    log("Extracting directory and filename...");
    const directory = path.dirname(filePath);
    const filename = path.basename(filePath);
  
    log(`Directory: ${directory}`);
    log(`Filename: ${filename}`);
  
    // Create good folder if it doesn't exist
    const goodFolderPath = path.join(directory, config.goodFolder);
    log(`Creating 'good' folder if it doesn't exist...`);
    try {
      await Deno.mkdir(goodFolderPath, { recursive: true });
      log(`'Good' folder created at: ${goodFolderPath}`);
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  
    // Move the file
    const newPath = path.join(goodFolderPath, filename);
    log("Moving file to 'good' folder...");
    try {
      await Deno.rename(filePath, newPath);
      log(`Moved to good folder: ${filename}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        log(`Error: ${error.message}`);
      } else {
        log(`Unknown error: ${String(error)}`);
      }
    }
  }
  
  // Function to delete file
  export async function deleteFile(filePath: string): Promise<void> {
    log(`Deleting file: ${filePath}`);
    try {
      await Deno.remove(filePath);
      log(`File deleted: ${filePath}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        log(`Error deleting file: ${error.message}`);
      } else {
        log(`Unknown error deleting file: ${String(error)}`);
      }
    }
  }
  
  // Function to advance to next playlist item
  export async function advancePlaylist(): Promise<void> {
    log("Advancing to the next item in the playlist...");
  
    // Get the current playlist before advancing
    const currentPlaylistResponse = await fetch(
      `http://localhost:${config.vlcHttpPort}/requests/playlist.json`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      },
    );
  
    if (!currentPlaylistResponse.ok) {
      throw new Error(`HTTP error! status: ${currentPlaylistResponse.status}`);
    }
  
    const currentPlaylist: VlcPlaylist = await currentPlaylistResponse.json();
    const playlistItems = currentPlaylist.children[0].children || [];
    
    // Find the current item's index
    const currentIndex = playlistItems.findIndex((item: VlcNode) => item.current === "current");
    
    if (currentIndex === -1) {
      log("Current item not found in the playlist. Playing first item.");
      // If no item is marked as 'current', play the first item
      if (playlistItems.length > 0) {
        const firstItem = playlistItems[0];
        const endpoint = `http://localhost:${config.vlcHttpPort}/requests/status.json?command=pl_play&id=${firstItem.id}`;
        const advanceResponse = await fetch(endpoint, {
          headers: {
            "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
          },
        });
  
        if (!advanceResponse.ok) {
          const errorBody = await advanceResponse.text();
          log(`Failed to play first item: ${advanceResponse.status} - ${errorBody}`);
          throw new Error(`Failed to play first item: ${advanceResponse.status}`);
        }
        return;
      } else {
        log("Playlist is empty, cannot advance.");
        return;
      }
    }
  
    // Check if we're at the end of the playlist
    if (currentIndex < playlistItems.length - 1) {
      // If we're not at the end of the playlist, play the next item by ID
      const nextItem = playlistItems[currentIndex + 1];
      const endpoint = `http://localhost:${config.vlcHttpPort}/requests/status.json?command=pl_play&id=${nextItem.id}`;
      
      const advanceResponse = await fetch(endpoint, {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      });
  
      if (!advanceResponse.ok) {
        const errorBody = await advanceResponse.text();
        log(`Failed to advance playlist: ${advanceResponse.status} - ${errorBody}`);
        throw new Error(`Failed to advance playlist: ${advanceResponse.status}`);
      }
    } else {
      // If we're at the end of the playlist, loop back to the start
      log("Reached the end of the playlist. Looping back to the start.");
      if (playlistItems.length > 0) {
        const firstItem = playlistItems[0];
        const endpoint = `http://localhost:${config.vlcHttpPort}/requests/status.json?command=pl_play&id=${firstItem.id}`;
        const advanceResponse = await fetch(endpoint, {
          headers: {
            "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
          },
        });
  
        if (!advanceResponse.ok) {
          const errorBody = await advanceResponse.text();
          log(`Failed to play first item: ${advanceResponse.status} - ${errorBody}`);
          throw new Error(`Failed to play first item: ${advanceResponse.status}`);
        }
      } else {
        log("Playlist is empty, cannot loop back to start.");
      }
    }
  
    log("Advanced to the next item.");
  
    // Check the new current media
    const newPlaylistResponse = await fetch(
      `http://localhost:${config.vlcHttpPort}/requests/playlist.json`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      },
    );
  
    if (!newPlaylistResponse.ok) {
      throw new Error(`HTTP error! status: ${newPlaylistResponse.status}`);
    }
  
    const newPlaylist: VlcPlaylist = await newPlaylistResponse.json();
    const newCurrentMedia = newPlaylist.children[0].children?.find((item: VlcNode) =>
      item.current === "current"
    );
  
    if (newCurrentMedia?.id) {
      // If the current media ID is the same as the last played ID or has been played recently
      if (newCurrentMedia.id === lastPlayedItemId || recentlyPlayedIds.has(newCurrentMedia.id)) {
        log("Next item is the same as the previous item or has been played recently.");
        
        // If there's only one item left, don't advance again
        if (playlistItems.length <= 1) {
          log("Playlist has only one item left. Stopping advance.");
          return;
        }
        
        log("Advancing again...");
        recentlyPlayedIds.add(newCurrentMedia.id);
        await advancePlaylist(); // Call advancePlaylist again
      } else {
        // Store the ID of the *previous* item, not the current one
        // lastPlayedItemId = newCurrentMedia.id;
        recentlyPlayedIds.add(newCurrentMedia.id);
        log(`Added ${newCurrentMedia.id} to recently played items`);
        console.log(recentlyPlayedIds);
      }
    }
  }
  
  // Function to remove the most recently played playlist item
  export async function removeMostRecentlyPlayedPlaylistItem(): Promise<void> {
    log("Removing the most recently played playlist item...");
  
    if (!lastPlayedItemId) {
      log("No last played item ID found.");
      return;
    }
  
    const deleteResponse = await fetch(
      `http://localhost:${config.vlcHttpPort}/requests/status.json?command=pl_delete&id=${lastPlayedItemId}`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      },
    );
  
    if (!deleteResponse.ok) {
      const errorBody = await deleteResponse.text();
      log(`Failed to remove last played item: ${deleteResponse.status} - ${errorBody}`);
      throw new Error(`Failed to remove last played item: ${deleteResponse.status}`);
    } else {
      const json = await deleteResponse.json();
      const filename = json.information.category.meta.filename;
      log(`filename: ${filename}`);
      log("Most recently played playlist item removed.");
    }
  }
  
  // Add this function after the other utility functions
  export async function isShuffleEnabled(): Promise<boolean> {
    log("Checking if shuffle is enabled...");
    
    const response = await fetch(
      `http://localhost:${config.vlcHttpPort}/requests/status.json`,
      {
        headers: {
          "Authorization": `Basic ${btoa(`:${config.vlcHttpPassword}`)}`,
        },
      },
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const status: VlcStatus = await response.json();
    log(`Shuffle status: ${status.random}`);
    return status.random;
  }
  