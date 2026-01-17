#include <smartspectra/container/foreground_container.hpp>
#include <glog/logging.h>
#include <google/protobuf/util/json_util.h>
#include <iostream>
#include <cstdlib>
#include <string>

namespace spectra = presage::smartspectra;
namespace settings = presage::smartspectra::container::settings;
using DeviceType = presage::platform_independence::DeviceType;

// Global string to accumulate the final metrics JSON
std::string g_metrics_json;

int main(int argc, char** argv) {
    google::InitGoogleLogging(argv[0]);
    // Suppress logging to stderr - we only want clean JSON on stdout
    FLAGS_logtostderr = false;
    FLAGS_stderrthreshold = 3; // Only FATAL errors

    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <frame_path_pattern>" << std::endl;
        std::cerr << "Example: " << argv[0] << " /tmp/frames/frame%013d.png" << std::endl;
        return EXIT_FAILURE;
    }
    std::string frame_path_pattern = argv[1];

    // Read API key from environment
    const char* api_key_env = std::getenv("PRESAGE_API_KEY");
    if (!api_key_env) {
        std::cerr << "Error: PRESAGE_API_KEY environment variable not set." << std::endl;
        return EXIT_FAILURE;
    }

    // Configure for Spot mode (single measurement session) with REST integration
    settings::Settings<settings::OperationMode::Spot, settings::IntegrationMode::Rest> spot_settings;
    spot_settings.integration.api_key = api_key_env;
    spot_settings.spot.spot_duration_s = 30; // Analyze up to 30 seconds of video
    spot_settings.enable_edge_metrics = true; // Get local expression/micromotion data

    // KEY SETTING: Point to extracted frames instead of camera
    spot_settings.video_source.file_stream_path = frame_path_pattern;
    spot_settings.video_source.loop = false; // Don't loop, just analyze once

    spectra::container::SpotRestForegroundContainer<DeviceType::Cpu> container(spot_settings);

    // Callback for Core Metrics (Pulse, Breathing from Cloud API)
    auto status = container.SetOnCoreMetricsOutput(
        [](const presage::physiology::MetricsBuffer& metrics, int64_t timestamp_us) {
            google::protobuf::util::JsonPrintOptions options;
            options.add_whitespace = false; // Compact JSON output
            google::protobuf::util::MessageToJsonString(metrics, &g_metrics_json, options);
            return absl::OkStatus();
        }
    );

    if (!status.ok()) {
        std::cerr << "Failed to set core metrics callback: " << status.message() << std::endl;
        return EXIT_FAILURE;
    }

    // Initialize and run the analysis pipeline
    auto init_status = container.Initialize();
    if (!init_status.ok()) {
        std::cerr << "Initialization failed: " << init_status.message() << std::endl;
        return EXIT_FAILURE;
    }

    auto run_status = container.Run();
    if (!run_status.ok()) {
        std::cerr << "Analysis run failed: " << run_status.message() << std::endl;
        return EXIT_FAILURE;
    }

    // Output the final collected JSON to stdout for the Node.js backend to capture
    std::cout << g_metrics_json << std::endl;

    return EXIT_SUCCESS;
}
