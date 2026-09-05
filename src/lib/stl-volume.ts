import * as THREE from "three";

/**
 * Calculate the volume of a 3D mesh from its BufferGeometry.
 * Uses the signed volume of tetrahedra method:
 * V = Σ (p1 · (p2 × p3)) / 6
 *
 * Returns volume in cm³ (assumes geometry is in mm).
 */
export function calculateVolumeFromGeometry(geometry: THREE.BufferGeometry): number {
  const position = geometry.attributes.position;

  if (!position) return 0;

  let sum = 0;
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const p3 = new THREE.Vector3();

  if (geometry.index) {
    // Indexed geometry
    const index = geometry.index;
    const faces = index.count / 3;

    for (let i = 0; i < faces; i++) {
      const a = index.getX(i * 3);
      const b = index.getX(i * 3 + 1);
      const c = index.getX(i * 3 + 2);

      p1.fromBufferAttribute(position, a);
      p2.fromBufferAttribute(position, b);
      p3.fromBufferAttribute(position, c);

      sum += signedVolumeOfTriangle(p1, p2, p3);
    }
  } else {
    // Non-indexed geometry (typical for STL)
    const faces = position.count / 3;

    for (let i = 0; i < faces; i++) {
      p1.fromBufferAttribute(position, i * 3 + 0);
      p2.fromBufferAttribute(position, i * 3 + 1);
      p3.fromBufferAttribute(position, i * 3 + 2);

      sum += signedVolumeOfTriangle(p1, p2, p3);
    }
  }

  // Convert mm³ to cm³ (÷ 1000)
  return Math.abs(sum) / 1000;
}

function signedVolumeOfTriangle(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): number {
  return p1.dot(new THREE.Vector3().crossVectors(p2, p3)) / 6.0;
}

/**
 * Get the bounding box dimensions in mm
 */
export function getDimensions(geometry: THREE.BufferGeometry): { x: number; y: number; z: number } {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;

  if (!box) return { x: 0, y: 0, z: 0 };

  return {
    x: Math.round((box.max.x - box.min.x) * 100) / 100,
    y: Math.round((box.max.y - box.min.y) * 100) / 100,
    z: Math.round((box.max.z - box.min.z) * 100) / 100,
  };
}
