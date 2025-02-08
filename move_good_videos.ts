import { isShuffleEnabled, getCurrentMedia, decodeUri, moveFile, advancePlaylist, removeMostRecentlyPlayedPlaylistItem, log, lastPlayedItemId, recentlyPlayedIds, deleteFile } from "./function_list.ts";
import { shouldDelete, shouldMove } from "./config.ts";

main()
// Main function
async function main() {
  try {
    // Check shuffle status first
    const shuffleEnabled = await isShuffleEnabled();
    if (!shuffleEnabled) {
      log("Warning: Shuffle is not enabled. This script works best with shuffle enabled.");
    }

    // Get current media and ID before doing anything else
    const mediaUri = await getCurrentMedia();
    
    // Check if mediaUri is null
    if (!mediaUri) {
      log("No media to process. Exiting.");
      return;
    }

    const currentId = lastPlayedItemId; // Store locally to ensure it doesn't change

    if (!currentId) {
      throw new Error("Failed to get current item ID");
    }

    // Decode the URI
    log("Decoding URL encoding...");
    const filePath = decodeUri(mediaUri.replace("file://", ""));
    log(`Decoded media path: ${filePath}`);

    // Only proceed with playlist operations if file operation was successful
    try {
      // First advance to the next item
      await advancePlaylist();

      // Perform the selected operation
      if (shouldDelete) {
        await deleteFile(filePath);
      } else if (shouldMove) {
        await moveFile(filePath);
      } else {
        log("No operation selected. Exiting.");
        Deno.exit(1);
      }

      // Then remove the previous item after we've successfully advanced
      await removeMostRecentlyPlayedPlaylistItem();

    } catch (playlistError: unknown) {
      if (playlistError instanceof Error) {
        log(`Warning: Playlist operation failed: ${playlistError.message}`);
      } else {
        log(`Warning: Unknown playlist operation error: ${String(playlistError)}`);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      log(`Error: ${error.message}`);
    } else {
      log(`Unknown error: ${String(error)}`);
    }
    Deno.exit(1);
  }
}



