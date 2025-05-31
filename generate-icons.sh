#!/bin/bash

# Source logo must be a high-res square PNG (e.g., 1024x1024 or larger)
SRC_LOGO="logo.png"
OUT_DIR="icons"

# Create the output directory if it doesn't exist
mkdir -p "$OUT_DIR"

# Define the sizes required for icons
sizes=(72 96 128 144 152 192 384 512)

# Resize logo slightly smaller (90%) and center it in transparent background
for size in "${sizes[@]}"; do
  inner_size=$(awk "BEGIN {print int($size * 0.9)}")
  
  magick convert "$SRC_LOGO" \
    -resize ${inner_size}x${inner_size} \
    -gravity center \
    -background none \
    -extent ${size}x${size} \
    "$OUT_DIR/icon-${size}x${size}.png"

  echo "✅ Created transparent, maskable icon-${size}x${size}.png"
done
