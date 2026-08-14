import * as THREE from 'three';

export class PerformanceOptimizer {
    constructor(camera) {
        this.camera = camera;
        this.frustum = new THREE.Frustum();
        this.projScreenMatrix = new THREE.Matrix4();
        this.cullableObjects = [];
    }

    /**
     * Register objects/meshes that should be culled when out of camera view.
     * @param {Array<THREE.Object3D>} objects 
     */
    registerObjects(objects) {
        this.cullableObjects = objects;
    }

    /**
     * Call this inside the main requestAnimationFrame loop.
     */
    update() {
        if (!this.cullableObjects.length) return;

        // Calculate current Camera Frustum
        this.projScreenMatrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        );
        this.frustum.setFromProjectionMatrix(this.projScreenMatrix);

        // Check visibility for registered objects
        for (let i = 0; i < this.cullableObjects.length; i++) {
            const obj = this.cullableObjects[i];

            // Use world position to test against camera frustum
            const objPos = new THREE.Vector3();
            obj.getWorldPosition(objPos);

            // Radius buffer (15 units) prevents pop-in at screen edges
            const inFrustum = this.frustum.intersectsSphere(
                new THREE.Sphere(objPos, 15)
            );

            obj.visible = inFrustum;
        }
    }
}
