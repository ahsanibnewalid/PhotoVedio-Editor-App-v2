# v1 → v2 Advanced Editor Merge

This branch integrates the advanced media-editing capabilities from PhotoVedio-Editor-App into the v2 architecture while keeping v2's screen/component organization.

## Integrated capabilities
- Multi-track timeline model
- LUT presets and 3D LUT-ready shader pipeline
- Subject cutout / segmentation model types
- Export presets and hardware codec settings
- FFmpeg/MediaCodec export abstraction
- Cinematic/anamorphic rendering settings

## Integration policy
The v2 application architecture remains authoritative. v1 functionality is ported as reusable modules rather than replacing v2 screens wholesale.

## Native runtime note
The repository remains a web-based architecture/workbench until native Android modules are added. FFmpeg/ML Kit integrations are represented behind platform adapters so the UI remains buildable without native dependencies.
