#!/bin/bash

# Usage: ./process_route_video.sh <input_video_path> <output_dir>
# Example: ./process_route_video.sh ./video.mp4 ./output

INPUT_VIDEO=$1
OUTPUT_DIR=$2

if [ -z "$INPUT_VIDEO" ] || [ -z "$OUTPUT_DIR" ]; then
    echo "Usage: $0 <input_video_path> <output_dir>"
    exit 1
fi

# Ensure output directories exist
mkdir -p "$OUTPUT_DIR/frames"

# Extract Audio
echo "Extracting audio..."
ffmpeg -i "$INPUT_VIDEO" -q:a 0 -map a "$OUTPUT_DIR/audio.mp3" -y

# Extract Frames (WebP, 24fps, quality 80)
# Height 1080 for desktop is a good standard
echo "Extracting frames..."
ffmpeg -i "$INPUT_VIDEO" \
    -vf "fps=24,scale=-1:1080" \
    -c:v libwebp \
    -q:v 80 \
    "$OUTPUT_DIR/frames/frame_%04d.webp"

echo "Done!"
