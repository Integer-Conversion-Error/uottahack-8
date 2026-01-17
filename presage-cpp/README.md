# Presage C++ CLI

This directory contains a C++ command-line tool that uses the Presage SmartSpectra SDK to analyze video frames for vital signs and expressions.

## Prerequisites

- **WSL (Ubuntu 22.04 LTS)** - *Critical: Ubuntu 24.04 is NOT compatible with the SDK.*
- Presage SmartSpectra C++ SDK (v2.0.4)
- `ffmpeg` (for frame extraction)
- CMake 3.16+
- Build tools (GCC/Clang)

## Setup Guide (Windows Users)

### 1. Install WSL (Ubuntu 22.04)

The Presage SDK currently only supports Ubuntu 22.04. Newer versions (24.04) will fail due to dependency conflicts (OpenCV/libcodec).

Open PowerShell as Administrator:
```powershell
wsl --install -d Ubuntu-22.04
```
*Follow the prompts to create a username and password.*

### 2. Enter WSL and Install Dependencies

Open your WSL terminal:
```bash
wsl -d Ubuntu-22.04
```

Update and install required build tools and libraries:
```bash
sudo apt update
sudo apt install -y cmake build-essential curl gnupg \
    libgoogle-glog-dev libprotobuf-dev libabsl-dev \
    libcurl4-openssl-dev libssl-dev \
    libv4l-dev libopengl-dev libegl1-mesa-dev libgl1-mesa-dev libgles2-mesa-dev
```

### 3. Install Presage SDK

Add the Presage Debian repository:
```bash
curl -s 'https://presage-security.github.io/PPA/KEY.gpg' | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/presage-technologies.gpg >/dev/null
sudo curl -s --compressed -o /etc/apt/sources.list.d/presage-technologies.list 'https://presage-security.github.io/PPA/presage-technologies.list'
sudo apt update
```

Install the specific compatible version (v2.0.4):
```bash
# Version 2.1.0 is broken (requires unavailable dependencies), so we enforce 2.0.4
sudo apt install -y libsmartspectra-dev=2.0.4
```

### 4. Apply SDK Fixes

The SDK's CMake configuration has a bug where it requests `GLES3`, which is not a standard CMake component. You must patch the config files:

```bash
# Remove "GLES3" requirement from SmartSpectraConfig.cmake
sudo sed -i 's/find_package(OpenGL REQUIRED OpenGL GLES3)/find_package(OpenGL REQUIRED)/' /usr/local/lib/cmake/SmartSpectra/SmartSpectraConfig.cmake

# Remove "GLES3" requirement from PhysiologyEdgeConfig.cmake (dependency)
sudo sed -i 's/find_package(OpenGL REQUIRED OpenGL GLES3)/find_package(OpenGL REQUIRED)/' /usr/local/lib/cmake/PhysiologyEdge/PhysiologyEdgeConfig.cmake
```

### 5. Build the CLI

Navigate to the project directory (accessible via `/mnt/c/...`):

```bash
# Adjust path to match your actual location
cd "/mnt/c/Users/<YOUR_USER>/Desktop/Self Improvement/Coding Projects/uottahack-8/presage-cpp"

# Create build directory
rm -rf build && mkdir build && cd build

# Configure and Build
cmake ..
make
```

The executable will be created at `./presage-cli`.

## Usage

This CLI takes a **path pattern** to extracted image frames, not a video file.

**Manual Test:**
```bash
# 1. Extract frames
mkdir -p /tmp/frames
ffmpeg -i /mnt/c/Users/<YOUR_USER>/Downloads/test_video.mp4 -vf fps=30 /tmp/frames/frame%013d.png

# 2. Run Analysis
export PRESAGE_API_KEY=your_key_here
./presage-cli "/tmp/frames/frame%013d.png"
```

**Production Use:**
The Node.js backend handles frame extraction automatically. Just verify `PRESAGE_USE_MOCK=false` in your `.env` file and that `PRESAGE_API_KEY` is set.
