document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 15, 35, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(124, 58, 237, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 15, 35, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});



const swiper = new Swiper(".projectsSwiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
    },
    pagination: {
    el: ".swiper-pagination",
    clickable: true,
    },
    breakpoints: {
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 },
    },
});

class ThreeJSScene {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.model = null;
        this.particles = null;
        this.animationId = null;
        this.isMobile = this.detectMobile();
        this.particleCount = this.isMobile ? 500 : 1000;
        
        this.config = {
            modelPath: '/assets/3d-models/prinny.gltf',
            modelScale: 1,
            modelPosition: { x: 0, y: -90, z: 0 },
            rotationSpeed: 0.005,
            particleSpeed: 1,
            cameraPosition: { x: -50, y: 200, z: 200 },
            cameraFov: 40,
            rendererSize: {
                mobile: 200,
                desktop: 300
            }
        };
        
        this.init();
    }
    
    detectMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    init() {
        try {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                console.error(`Container with id "${this.containerId}" not found`);
                return;
            }
            
            this.createScene();
            this.createCamera();
            this.createRenderer();
            this.createLights();
            this.createControls();
            this.createParticles();
            this.loadModel();
            this.setupEventListeners();
            this.animate();
            
        } catch (error) {
            console.error('Error initializing Three.js scene:', error);
        }
    }
    
    createScene() {
        this.scene = new THREE.Scene();
    }
    
    createCamera() {
        const size = this.isMobile ? this.config.rendererSize.mobile : this.config.rendererSize.desktop;
        this.camera = new THREE.PerspectiveCamera(
            this.config.cameraFov,
            size / size,
            0.1,
            1000
        );
        
        this.camera.position.set(
            this.config.cameraPosition.x,
            this.config.cameraPosition.y,
            this.config.cameraPosition.z
        );
    }
    
    createRenderer() {
        const size = this.isMobile ? this.config.rendererSize.mobile : this.config.rendererSize.desktop;
        
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(size, size);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const dirLight1 = new THREE.DirectionalLight(0xE51025, 1.5);
        dirLight1.position.set(-1000, 200, 0);
        dirLight1.castShadow = true;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        this.scene.add(dirLight1);
        
        const dirLight2 = new THREE.DirectionalLight(0x1025E5, 2);
        dirLight2.position.set(1000, 200, 100);
        dirLight2.castShadow = true;
        dirLight2.shadow.mapSize.width = 1024;
        dirLight2.shadow.mapSize.height = 1024;
        this.scene.add(dirLight2);
        
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 1000);
        pointLight.position.set(0, 100, 200);
        this.scene.add(pointLight);
    }
    
    createControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.minPolarAngle = Math.PI / 3;
        }
    }
    
    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        
        const color1 = new THREE.Color(0x7c3aed);
        const color2 = new THREE.Color(0xa855f7);
        
        for (let i = 0; i < this.particleCount; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 500;
            positions[i * 3 + 1] = Math.random() * 500;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 500;
            
            const color = color1.clone().lerp(color2, Math.random());
            colors[i * 3 + 0] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.isMobile ? 1.5 : 2,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    loadModel() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('GLTFLoader not available');
            return;
        }
        
        const loader = new THREE.GLTFLoader();
        loader.load(
            this.config.modelPath,
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        if (!child.geometry.hasAttribute('normal')) {
                            child.geometry.computeVertexNormals();
                        }
                        
                        child.material = new THREE.MeshPhongMaterial({
                            color: child.material.color ? child.material.color : new THREE.Color(0xffffff),
                            shininess: 100,
                            specular: new THREE.Color(0x7c3aed),
                            map: child.material.map || null,
                            transparent: true,
                            opacity: 0.95
                        });
                        
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                gltf.scene.position.set(
                    this.config.modelPosition.x,
                    this.config.modelPosition.y,
                    this.config.modelPosition.z
                );
                gltf.scene.scale.setScalar(this.config.modelScale);
                
                this.model = gltf.scene;
                this.scene.add(this.model);
            },
            (progress) => {},
            (error) => {
                console.error('Error loading GLTF model:', error);
                this.createFallbackGeometry();
            }
        );
    }
    
    createFallbackGeometry() {
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x7c3aed,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        this.model = new THREE.Mesh(geometry, material);
        this.model.position.set(0, 0, 0);
        this.scene.add(this.model);
    
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else {
                this.resumeAnimation();
            }
        });
    }
    
    onWindowResize() {
        const size = this.isMobile ? this.config.rendererSize.mobile : this.config.rendererSize.desktop;
        
        this.camera.aspect = size / size;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(size, size);
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.model) {
            this.model.rotation.y += this.config.rotationSpeed;
        }
        
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < this.particleCount; i++) {
                positions[i * 3 + 1] -= this.config.particleSpeed;
                
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 500;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    pauseAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resumeAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }
    
    destroy() {
        this.pauseAnimation();
        
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.prinnyScene = new ThreeJSScene('prinny-container');
    }, 100);
    
    initializeSideEffects();
});

 
class SideEffects {
    constructor() {
        this.particles = [];
        this.shapes = [];
        this.orbs = [];
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }
    
    init() {
        this.createParticles();
        this.createGeometricShapes();
        this.createFloatingOrbs();
        this.setupEventListeners();
    }
    
    createParticles() {
        const container = document.getElementById('floating-particles');
        if (!container) return;
        
        const particleCount = this.isMobile ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            
            const size = Math.random() * 6 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            
            particle.style.animationDelay = Math.random() * 6 + 's';
            
            container.appendChild(particle);
            this.particles.push(particle);
        }
    }
    
    createGeometricShapes() {
        const container = document.getElementById('geometric-shapes');
        if (!container) return;
        
        const shapeCount = this.isMobile ? 5 : 10;
        const shapes = ['triangle', 'square', 'circle'];
        
        for (let i = 0; i < shapeCount; i++) {
            const shape = document.createElement('div');
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            
            shape.className = `shape ${shapeType}`;
            
            
            shape.style.left = Math.random() * 100 + '%';
            shape.style.top = Math.random() * 100 + '%';
            shape.style.animationDelay = Math.random() * 12 + 's';
            
            container.appendChild(shape);
            this.shapes.push(shape);
        }
    }
    
    createFloatingOrbs() {
        const container = document.getElementById('floating-orbs');
        if (!container) return;
        
        const orbCount = this.isMobile ? 2 : 3;
        
        for (let i = 0; i < orbCount; i++) {
            const orb = document.createElement('div');
            orb.className = 'orb';
            
            
            orb.style.left = Math.random() * 100 + '%';
            orb.style.top = Math.random() * 100 + '%';
            
            
            orb.style.animationDelay = Math.random() * 20 + 's';
            
            container.appendChild(orb);
            this.orbs.push(orb);
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }
    
    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            this.recreateEffects();
        }
    }
    
    recreateEffects() {
        
        this.clearEffects();
        
        
        this.createParticles();
        this.createGeometricShapes();
        this.createFloatingOrbs();
    }
    
    clearEffects() {
        const containers = [
            'floating-particles',
            'geometric-shapes', 
            'floating-orbs'
        ];
        
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
            }
        });
        
        this.particles = [];
        this.shapes = [];
        this.orbs = [];
    }
    
    handleMouseMove(e) {
        if (this.isMobile) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        
        this.particles.forEach((particle, index) => {
            const speed = (index % 3 + 1) * 0.5;
            const moveX = (mouseX - 0.5) * speed * 20;
            const moveY = (mouseY - 0.5) * speed * 20;
            
            particle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        
        this.orbs.forEach((orb, index) => {
            const speed = (index % 2 + 1) * 0.3;
            const moveX = (mouseX - 0.5) * speed * 30;
            const moveY = (mouseY - 0.5) * speed * 30;
            
            orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }
}

 
function initializeSideEffects() {
    window.sideEffects = new SideEffects();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeJSScene;
}



