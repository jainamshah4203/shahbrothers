# Stationery 3D models

Place Draco-compressed GLB assets here for product previews.

| File | Used by |
|------|---------|
| `fountain-pen.glb` | `Interactive3DPen` |

Until `fountain-pen.glb` is present, `Interactive3DPen` falls back to a procedural mesh with the same material targets (`body`, `clip`, `nib`).

Compress before shipping:

```bash
gltf-pipeline -i fountain-pen.glb -o fountain-pen.glb -d
```
