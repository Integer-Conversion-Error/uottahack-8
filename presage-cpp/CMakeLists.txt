cmake_minimum_required(VERSION 3.16)
project(presage_cli CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add SmartSpectra's cmake module path (for FindV4L, etc.)
list(APPEND CMAKE_MODULE_PATH "/usr/local/lib/cmake/SmartSpectra/modules")
list(APPEND CMAKE_PREFIX_PATH "/usr/local/lib/cmake")

# Set OpenGL preference to avoid legacy warnings
set(OpenGL_GL_PREFERENCE "GLVND")

# Find SmartSpectra SDK - this brings in all required dependencies
find_package(SmartSpectra REQUIRED)

add_executable(presage-cli main.cpp)

# SmartSpectra::SmartSpectra target includes all necessary transitive dependencies
target_link_libraries(presage-cli SmartSpectra::SmartSpectra)

# Install the executable to the build directory
install(TARGETS presage-cli DESTINATION bin)
