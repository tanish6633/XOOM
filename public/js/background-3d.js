// FARM CENTRAL - AGRICULTURAL 3D BACKGROUND
// Features: Green Field, Growing Plants, Floating Seeds
// Optimized for performance

if (typeof THREE === 'undefined') {
    console.error("Three.js not loaded. Please include CDN.");
} else {
    init3D();
}

// FARM CENTRAL - ULTRA REALISTIC AGRICULTURE SYSTEM
// Features: Sunny Day, Dynamic Sky, Wind Simulation, Procedural Crops

function init3D() {
    // 1. Setup Container
    let container = document.getElementById('canvas-bg') || document.getElementById('canvas-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'canvas-bg';
        Object.assign(container.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
            zIndex: '-1', opacity: '1', pointerEvents: 'none'
        });
        document.body.prepend(container);
    }

    // 2. Scene & Authentic Camera
    // 2. Scene & Authentic Camera
    // 2. Scene & Authentic Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // Deepest Slate/Night
    scene.fog = new THREE.FogExp2(0x020617, 0.015); // Dense, moody fog

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 6, 20); // Slightly lower angle for drama
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Clear & Attach
    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // 3. Aesthetic Lighting
    // Ambient moon glow
    const hemiLight = new THREE.HemisphereLight(0x1e293b, 0x0f172a, 0.4);
    scene.add(hemiLight);

    // Main Moonlight (Cool Cyan)
    const moonLight = new THREE.DirectionalLight(0xcffafe, 0.8);
    moonLight.position.set(-20, 50, -20);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0001;
    scene.add(moonLight);

    // Rim Light (Warm Gold) - Adds the "Super Aesthetic" edge highlight
    const rimLight = new THREE.SpotLight(0xf59e0b, 2.0);
    rimLight.position.set(30, 10, 30);
    rimLight.lookAt(0, 0, 0);
    rimLight.penumbra = 1;
    scene.add(rimLight);

    // 4. Realistic Ground (Dark Soil)
    const planeGeo = new THREE.PlaneGeometry(300, 300, 128, 128);
    const pos = planeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Rolling hills
        const z = Math.sin(x * 0.08) * 1.5 + Math.cos(y * 0.08) * 1.5 + Math.random() * 0.1;
        pos.setZ(i, z);
    }
    planeGeo.computeVertexNormals();

    const planeMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Dark soil/grass
        roughness: 0.6,
        metalness: 0.2, // Slight sheen (wet ground)
        flatShading: false
    });
    const ground = new THREE.Mesh(planeGeo, planeMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 5. Procedural Vegetation (Glowing/lit up)
    const stemsCount = 500; // More density
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.06, 1.8, 6);
    stemGeo.translate(0, 0.9, 0);

    // Material reacting to the rim light
    const stemMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        roughness: 0.5,
        emissive: 0x064e3b, // Subtle inner glow
        emissiveIntensity: 0.2
    });
    const cornMesh = new THREE.InstancedMesh(stemGeo, stemMat, stemsCount);

    const dummy = new THREE.Object3D();
    const plantsData = [];

    for (let i = 0; i < stemsCount; i++) {
        const x = (Math.random() - 0.5) * 70;
        const z = (Math.random() - 0.5) * 60; // Closer grouping
        const y = Math.sin(x * 0.08) * 1.5 + Math.cos(-z * 0.08) * 1.5; // Match terrain roughly

        dummy.position.set(x, y, z);
        const scale = 0.7 + Math.random() * 0.6;
        dummy.scale.set(scale, scale, scale);
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.rotation.z = (Math.random() - 0.5) * 0.3;

        dummy.updateMatrix();
        cornMesh.setMatrixAt(i, dummy.matrix);

        plantsData.push({
            id: i,
            baseX: x, baseZ: z, baseY: y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5
        });
    }
    cornMesh.castShadow = true;
    cornMesh.receiveShadow = true;
    scene.add(cornMesh);

    // 6. Magic Particles (Fireflies/Spores)
    const particleCount = 300;
    const particles = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        pPos[i] = (Math.random() - 0.5) * 80;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xfcd34d, // Gold/Amber
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const fireflies = new THREE.Points(particles, pMat);
    scene.add(fireflies);

    // 7. Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Wind Simulation on Plants
        plantsData.forEach((p, i) => {
            // Calculate wind sway
            const sway = Math.sin(t * p.speed + p.phase) * 0.15 + Math.sin(t * 0.5) * 0.05;

            dummy.position.set(p.baseX, p.baseY, p.baseZ);
            dummy.rotation.set(sway, Math.random() * 0.1, sway * 0.5); // 3D Sway
            dummy.scale.setScalar(1); // Reset scale or keep

            dummy.updateMatrix();
            cornMesh.setMatrixAt(i, dummy.matrix);
        });
        cornMesh.instanceMatrix.needsUpdate = true;

        // Floating Fireflies
        const positions = fireflies.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) { // Y axis
            positions[i] += Math.sin(t + positions[i - 1]) * 0.02;
            if (positions[i] > 20) positions[i] = 0;
        }
        fireflies.geometry.attributes.position.needsUpdate = true;

        // Slight Camera Drift (Cinematic)
        camera.position.x = Math.sin(t * 0.05) * 5;
        camera.lookAt(0, 3, 0);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
