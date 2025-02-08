#!/bin/bash

# Get the focused window's class
FOCUSED_WINDOW=$(xdotool getwindowfocus getwindowname)

# Check if the focused window contains "VLC"
if [[ "$FOCUSED_WINDOW" == *"VLC"* ]]; then
    deno run --allow-net --allow-read --allow-write "/mnt/MG09/JD/40-49 IT/44 ownSoftware/vlc/move_good_videos.ts" --delete 2>&1
fi 

