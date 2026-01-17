# Presage C++ CLI

This directory contains a C++ command-line tool that uses the Presage SmartSpectra SDK to analyze video frames for vital signs and expressions.

## Prerequisites

- **Linux** (Ubuntu 22.04 / Linux Mint 21) - Use WSL if on Windows
- Presage SmartSpectra C++ SDK installed from their Debian repository
- `ffmpeg` installed for frame extraction
- CMake 3.16+, GCC/Clang with C++17 support

## Setup on WSL (Windows Users)

```bash
# Install WSL with Ubuntu if not already done
wsl --install -d Ubuntu-22.04

# Inside WSL, follow Presage's installation guide:
# https://docs.physiology.presagetech.com/cpp/index.html

# Install build tools
sudo apt update
sudo apt install -y cmake build-essential ffmpeg
```

## Build

```bash
cd presage-cpp
mkdir build && cd build
cmake ..
make
```

The executable will be at `./presage-cli`.

## Usage

The CLI expects a path pattern to extracted video frames:

```bash
# First, extract frames from a video using ffmpeg
ffmpeg -i /path/to/video.mp4 -vf fps=30 /tmp/frames/frame%013d.png

# Then run the CLI
export PRESAGE_API_KEY=your_key_here
./presage-cli "/tmp/frames/frame%013d.png"
```

## Output

Outputs a JSON object with physiological metrics (pulse, breathing, etc.) to stdout.
