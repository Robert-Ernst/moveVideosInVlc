# VLC Media Mover

This script automates the process of moving media files from a VLC playlist to a designated "good" folder after playback, and then removes the played item from the playlist. It interacts with the VLC media player via its HTTP interface.

## Overview

The script performs the following actions:

1.  **Checks VLC Shuffle Status**: Verifies if shuffle mode is enabled in VLC.
2.  **Retrieves Current Media**: Fetches the currently playing media file's URI from VLC.
3.  **Moves Media File**: Moves the media file to a "good" folder.
4.  **Advances Playlist**: Advances to the next item in the VLC playlist.
5.  **Removes Played Item**: Removes the previously played item from the playlist.

## Prerequisites

*   **Deno**: Ensure that Deno is installed on your system. You can download it from the [official Deno website](https://deno.land/).
*   **VLC Media Player**: VLC must be installed and configured to allow HTTP interface access.
*   **VLC HTTP Interface**: Enable the HTTP interface in VLC and set a password.

## Configuration

The script relies on a configuration file (`config.ts`) to store settings such as the VLC HTTP port, password, and the name of the "good" folder.

### `config.ts`

*   `vlcHttpPort`: The port number used by VLC's HTTP interface (default: 42339).
*   `vlcHttpPassword`: The password set for the VLC HTTP interface.  **Important**: Change the default password.
*   `goodFolder`: The name of the folder where "good" media files will be moved (default: "good").

## Usage

1.  **Clone the Repository**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Configure `config.ts`**:  Edit the `config.ts` file with your VLC HTTP port, password, and desired "good" folder name.

3.  **Run the Script**: Execute the `move_good_videos.ts` script using Deno.

    ```bash
    deno run --allow-net --allow-read --allow-write move_good_videos.ts
    ```

    *   `--allow-net`: Allows network access for interacting with the VLC HTTP interface.
    *   `--allow-read`: Allows reading files to determine their paths.
    *   `--allow-write`: Allows writing files to move them to the "good" folder.

## Script Components

### `move_good_videos.ts`

This is the main script that orchestrates the entire process. It imports functions from `function_list.ts` and uses the configuration from `config.ts`.

### `function_list.ts`

This module contains the core functions for interacting with VLC and managing the media files.

*   `log(message: string)`: Logs messages with timestamps for debugging.
*   `decodeUri(uri: string)`: Decodes URL-encoded strings.
*   `getCurrentMedia(): Promise<string | null>`: Retrieves the URI of the currently playing media from VLC.
*   `moveFile(filePath: string): Promise<void>`: Moves the specified file to the "good" folder.
*   `advancePlaylist(): Promise<void>`: Advances the VLC playlist to the next item.  Handles looping back to the beginning of the playlist if the end is reached.
*   `removeMostRecentlyPlayedPlaylistItem(): Promise<void>`: Removes the most recently played item from the VLC playlist.
*   `isShuffleEnabled(): Promise<boolean>`: Checks if shuffle mode is enabled in VLC.

### `config.ts`

As described in the Configuration section, this file contains the configuration settings for the script.

## Important Considerations

*   **Error Handling**: The script includes error handling to manage potential issues such as network errors, file system errors, and VLC HTTP interface errors.
*   **Permissions**: Ensure that the script has the necessary permissions to access the network, read files, and write files.
*   **VLC Configuration**: Double-check that the VLC HTTP interface is correctly configured and that the password is set.
*   **Shuffle Mode**: The script is designed to work with or without shuffle mode enabled.  If shuffle is not enabled, the playlist will advance to the next item in the list.
*   **Looping**: When the end of the playlist is reached, the script will loop back to the beginning.
*   **Duplicate Prevention**: The script attempts to prevent playing the same item multiple times in a row.

## Troubleshooting

*   **Network Errors**: Check your network connection and ensure that VLC is running and accessible on the specified port.
*   **File System Errors**: Verify that the script has the necessary permissions to read and write files.
*   **VLC HTTP Interface Errors**: Double-check the VLC HTTP interface configuration and password.
*   **Logging**: Examine the log messages in the console for any error messages or warnings.
