cmake_minimum_required(VERSION 3.16)
project(presage_cli CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add SmartSpectra's cmake module path (for FindV4L, etc.)
list(APPEND CMAKE_MODULE_PATH "/usr/local/lib/cmake/SmartSpectra/modules")
list(APPEND CMAKE_PREFIX_PATH "/usr/local/lib/cmake")

# Set OpenGL preference to avoid legacy warnings
set(OpenGL_GL_PREFERENCE "GLVND")

# Find OpenGL first and create GLES3 target if missing
find_package(OpenGL REQUIRED)
if (NOT TARGET OpenGL::GLES3)
    # Create OpenGL::GLES3 as an alias to OpenGL::OpenGL
    # (SmartSpectra SDK has a dependency on this target which CMake doesn't provide)
    find_library(GLESv2_LIBRARY NAMES GLESv2)
    if (GLESv2_LIBRARY)
        add_library(OpenGL::GLES3 SHARED IMPORTED)
        set_target_properties(OpenGL::GLES3 PROPERTIES 
            IMPORTED_LOCATION "${GLESv2_LIBRARY}"
        )
    else()
        # Fallback: Create interface-only target pointing to OpenGL
        add_library(OpenGL::GLES3 INTERFACE IMPORTED)
        set_target_properties(OpenGL::GLES3 PROPERTIES 
            INTERFACE_LINK_LIBRARIES OpenGL::OpenGL
        )
    endif()
endif()

# Find SmartSpectra SDK
find_package(SmartSpectra REQUIRED)

add_executable(presage-cli main.cpp)

# Link against SmartSpectra::Container which includes all SDK functionality
target_link_libraries(presage-cli 
    SmartSpectra::Container
    SmartSpectra::VideoSource
)

# Install the executable to the build directory
install(TARGETS presage-cli DESTINATION bin)
