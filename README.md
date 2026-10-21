# PhotoVedio Editor App v2

A modern, lightweight photo and video editor architecture focused on fast editing, cinematic effects, multi-track timelines, color grading, subject cutouts, and flexible export workflows.

> **v2 is the primary development project.** Advanced editing concepts from v1 are being integrated into the v2 architecture while preserving v2's cleaner screen/component structure.

## Original v1 Source

The original v1 project remains available here:

**https://github.com/ahsanibnewalid/PhotoVedio-Editor-App**

Use the v1 repository to inspect the original source, history, and implementation used as the basis for the v2 merge.

## Current Status

**Active development — editor architecture/workbench.**

The repository currently provides the editor UI/workbench, application architecture, editing models, shader organization, export configuration, and platform-adapter design.

The current repository should **not** be described as a fully native production Android editor yet. Native execution for FFmpeg-Kit, Android MediaCodec, ML Kit segmentation, and native GPU processing still requires the Android-native implementation layer.

## Features

### Video editing
- Multi-track timeline model
- Video and photo clips
- Layer-based editing
- Text overlays
- Media effects
- Cinematic presentation
- Export configuration

### Photo editing
- Image editing architecture
- Filters and color adjustments
- LUT-based grading
- Cinematic effects
- Overlays and text
- Subject cutout architecture
- Layer-based composition

### Color grading
- LUT presets
- 3D LUT-ready shader pipeline
- Cinematic color grading
- Shader-based processing

### Subject cutout
Architecture for:
- Person/subject segmentation
- Background removal
- Subject isolation
- Layer compositing

The native ML implementation is planned for the Android runtime layer.

### Cinematic effects
- Anamorphic-style presentation
- Cinematic letterboxing
- Film-style processing
- LUT-based grading
- GPU/shader effects

### Export
Defined export profiles include:
- Reels
- YouTube
- YouTube 4K
- Web
- Custom

Export configuration supports resolution, FPS, bitrate, and H.264/HEVC codec selection.

## v1 → v2 Merge

Advanced concepts from the original v1 project have been integrated into v2 without replacing the v2 architecture.

Integrated areas include:
- Multi-track timeline model
- LUT presets and 3D LUT-ready shader pipeline
- Subject cutout/segmentation models
- Export presets
- Hardware codec settings
- FFmpeg/MediaCodec export abstraction
- Cinematic/anamorphic rendering settings

See [`MERGE_PLAN.md`](MERGE_PLAN.md) for the merge details and the original v1 source link.

## Architecture

```text
PhotoVedio-Editor-App-v2/
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── screens/
│   ├── shaders/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── MERGE_PLAN.md
├── package.json
└── README.md
```

The design separates the editor UI from media-processing implementations so native Android functionality can be added later through platform adapters.

## Development

### Requirements
- Node.js
- npm
- Git
- Modern web browser

### Install

```bash
git clone https://github.com/ahsanibnewalid/PhotoVedio-Editor-App-v2.git
cd PhotoVedio-Editor-App-v2
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Native Runtime Roadmap

- [ ] Android project/runtime
- [ ] MediaCodec integration
- [ ] FFmpeg integration
- [ ] ML Kit integration
- [ ] Native GPU rendering
- [ ] Real media loading
- [ ] Timeline interactions
- [ ] Clip trimming/splitting
- [ ] Production LUT renderer
- [ ] Reliable H.264/HEVC export
- [ ] 1080p/4K export
- [ ] Device performance testing
- [ ] Production release validation

## Important Development Principle

The project distinguishes between **architecture/configuration** and **actual native execution**. A feature is only considered production-ready after it is implemented and tested in the target runtime.

## Repositories

**Current v2:**
https://github.com/ahsanibnewalid/PhotoVedio-Editor-App-v2

**Original v1:**
https://github.com/ahsanibnewalid/PhotoVedio-Editor-App

## License

See the repository license for current licensing information.
