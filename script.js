document.addEventListener("DOMContentLoaded", () => {

    // ── REFERENCIAS ──
    const btnTema       = document.getElementById("btn-tema");
    const bgDia         = document.querySelector(".bg-dia");
    const bgNoche       = document.querySelector(".bg-noche");
    const cieloEst      = document.getElementById("cielo-estrellado");
    const tiltWrapper   = document.getElementById("tilt-wrapper");
    const pantallaLogin = document.getElementById("pantalla-login");
    const pantallaSobre = document.getElementById("pantalla-sobre");
    const inputPass     = document.getElementById("input-password");
    const huellaBox     = document.getElementById("huella-box");
    const estadoLogin   = document.getElementById("estado-login");
    const sobre3d       = document.getElementById("sobre-3d");
    const caraDorso     = document.getElementById("cara-dorso");
    const selloSobre    = document.getElementById("sello-sobre");
    const solapaSup     = document.getElementById("aleta-sup");
    const carta         = document.getElementById("carta");
    const btnCerrar     = document.getElementById("btn-cerrar");
    const textoMaquina  = document.getElementById("texto-maquina");
    const petalosBox    = document.getElementById("petalos-flotantes");
    const luciernagasBox= document.getElementById("luciernagas");
    const ramoInteractivo = document.getElementById("ramo-interactivo");
    const tooltipRamo   = document.getElementById("tooltip-ramo");
    const diasJuntos    = document.getElementById("dias-juntos");
    const corazonFirmaWrapper = document.getElementById("corazon-firma-wrapper");

    // ── TYPEWRITER TÍTULO LOGIN ──
    const tituloElegante = document.querySelector(".titulo-elegante");
    const textoTitulo = tituloElegante.textContent;
    tituloElegante.textContent = "";
    let charIndex = 0;

    // --- MEJORA 2: CONFIGURACIÓN GLARE DINÁMICO (CORREGIDO) ---
    if (!carta.querySelector('.carta-glare')) {
        const glareDiv = document.createElement("div");
        glareDiv.className = "carta-glare";
        carta.insertBefore(glareDiv, carta.firstChild);
    }

    let targetGx = 50, targetGy = 50;
    let currentGx = 50, currentGy = 50;

    pantallaSobre.addEventListener("mousemove", (e) => {
        if (!carta.classList.contains("fuera")) return;
        const rect = carta.getBoundingClientRect();
        
        // Verifica si el mouse está sobre la carta
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            targetGx = ((e.clientX - rect.left) / rect.width) * 100;
            targetGy = ((e.clientY - rect.top) / rect.height) * 100;
        } else {
            // Regresa al centro si sale de los límites
            targetGx = 50;
            targetGy = 50;
        }
    });

    // Soporte táctil
    pantallaSobre.addEventListener("touchmove", (e) => {
        if (!carta.classList.contains("fuera")) return;
        const rect = carta.getBoundingClientRect();
        const touch = e.touches[0];
        
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            targetGx = ((touch.clientX - rect.left) / rect.width) * 100;
            targetGy = ((touch.clientY - rect.top) / rect.height) * 100;
        } else {
            targetGx = 50;
            targetGy = 50;
        }
    }, { passive: true });

// --- MEJORA 3: INYECCIÓN DE MICRO-PARTÍCULAS ---
function generarPolvoCristal() {
    const cantidad = Math.floor(Math.random() * 5) + 8; // Entre 8 y 12
    for (let i = 0; i < cantidad; i++) {
        const polvo = document.createElement("div");
        polvo.className = "polvo-cristal";
        
        // Propiedades aleatorias
        const size = Math.random() * 2 + 1; // 1px a 3px
        const opacity = Math.random() * 0.2 + 0.15; // 0.15 a 0.35
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duracion = Math.random() * 5 + 4; // 4s a 9s
        const delay = Math.random() * -5;
        
        polvo.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${posX}%;
            top: ${posY}%;
            opacity: ${opacity};
            animation-duration: ${duracion}s;
            animation-delay: ${delay}s;
        `;
        carta.appendChild(polvo);
    }
}
generarPolvoCristal();

    function escribirTitulo() {
        if (charIndex < textoTitulo.length) {
            tituloElegante.textContent += textoTitulo[charIndex];
            charIndex++;
            setTimeout(escribirTitulo, 55);
        } else {
            inputPass.style.transition = "opacity 0.8s ease";
            inputPass.style.opacity = "1";
            const elEstado = document.getElementById("estado-login");
            elEstado.style.transition = "opacity 0.8s ease";
            elEstado.style.opacity = "0.7";
            const elDots = document.getElementById("login-dots");
            elDots.style.transition = "opacity 0.8s ease";
            elDots.style.opacity = "1";
        }
    }
    setTimeout(escribirTitulo, 400);

    const PASS    = "mari";
    const MENSAJE = "Desde que estás en mi vida, descubrí que mi lugar favorito es dondequiera que estemos juntos. Contigo, hasta lo más cotidiano se vuelve extraordinario y me hace sonreír sin darme cuenta y bla bla bla (VAYA CURSILERIA jajaja)";

    // 📅 Ajusta esta fecha a tu gusto
    const FECHA_INICIO = new Date("2026-08-08");

    const RAZONES = [
        "Por tu risa que me desarma 🌹",
        "Por cada detalle que nadie más nota 🌹",
        "Por ser mi lugar favorito 🌹",
        "Por hacer extraordinario lo cotidiano 🌹",
        "Por sorprenderme cada día 🌹",
        "Por ser mi historia favorita 🌹"
    ];
    let indiceRazon = 0;

    let sobreAbierto = false;
    let animando     = false;
    let typingInterval;
    let modoNoche    = false;
    let rotationBase = 0; 
    let latidoInterval;

    // ── ✨ INICIALIZAR GALAXIA THREE.JS (ÁNGULO Y GIRO EXACTOS) ✨ ──
    function initGalaxy() {
        if (typeof THREE === 'undefined') return;
        const container = document.getElementById('contenedor-galaxia');
        if (!container) return;

        const scene = new THREE.Scene();
        // Colocamos la cámara directamente de frente en el eje Z
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
        camera.position.set(0, 0, 16); 
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(240, 240); // Ajuste de lienzo para que no corte los bordes
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 🌌 Parámetros exactos de la imagen
        const count = 50000;
        const radius = 8;
        const arms = 5;      
        const spin = 0.35;
        const randomness = 0.5;
        const randomnessPower = 1.5;
        
        const innerColor = new THREE.Color('#ff6633'); 
        const outerColor = new THREE.Color('#cc0099'); 
        const coreColor = new THREE.Color('#ffffff');  

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const rand = Math.random();
            let currentRadius, heightFactor, isCoreParticle = false;

            if (rand < 0.20) {
                currentRadius = Math.pow(Math.random(), 3) * radius * 0.3;
                heightFactor = 1.0;
                isCoreParticle = true;
            } else if (rand < 0.85) {
                currentRadius = Math.pow(Math.random(), 1.5) * radius;
                heightFactor = 0.05;
            } else {
                currentRadius = Math.pow(Math.random(), 0.8) * radius * 1.5;
                heightFactor = 0.6;
            }

            const armAngle = ((i % arms) / arms) * Math.PI * 2;
            const spinAngle = currentRadius * spin;
            const armSpread = Math.pow(Math.random(), 2) * 0.5 - 0.25;

            let x, y, z;
            if (isCoreParticle) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                x = currentRadius * Math.sin(phi) * Math.cos(theta);
                y = currentRadius * Math.sin(phi) * Math.sin(theta);
                z = currentRadius * Math.cos(phi);
            } else {
                x = Math.cos(armAngle + spinAngle + armSpread) * currentRadius;
                z = Math.sin(armAngle + spinAngle + armSpread) * currentRadius;
                y = (Math.random() - 0.5) * heightFactor * currentRadius;
            }

            const randomVal = Math.pow(Math.random(), randomnessPower);
            const randomAngle = Math.random() * Math.PI * 2;

            if (!isCoreParticle) {
                x += Math.cos(randomAngle) * randomVal * randomness * currentRadius * 0.5;
                y += (Math.random() - 0.5) * randomVal * randomness * currentRadius * heightFactor;
                z += Math.sin(randomAngle) * randomVal * randomness * currentRadius * 0.5;
            }

            positions[i3    ] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            let finalColor;
            const radiusRatio = currentRadius / radius;

            if (isCoreParticle) {
                finalColor = coreColor.clone().lerp(innerColor, radiusRatio * 2);
            } else if (currentRadius < radius * 0.3) {
                finalColor = innerColor.clone().lerp(coreColor, 1 - radiusRatio * 3);
            } else {
                finalColor = innerColor.clone().lerp(outerColor, radiusRatio);
            }

            const brightness = 0.7 + Math.random() * 0.3;
            finalColor.multiplyScalar(brightness);

            colors[i3    ] = finalColor.r;
            colors[i3 + 1] = finalColor.g;
            colors[i3 + 2] = finalColor.b;

            sizes[i] = isCoreParticle ? 1.8 : (0.5 + Math.random() * 1.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const canvasTexture = document.createElement('canvas');
        canvasTexture.width = 64; canvasTexture.height = 64;
        const ctx = canvasTexture.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
        gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
        const texture = new THREE.CanvasTexture(canvasTexture);

        const material = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: texture } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * 0.04 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                void main() {
                    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(vColor, 1.0) * texColor;
                }
            `,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        const points = new THREE.Points(geometry, material);
        
        // 🌟 ÁNGULO DE VISIÓN (PERSPECTIVA EXACTA) 🌟
        const grupoGalaxia = new THREE.Group();
        grupoGalaxia.add(points);
        
        // X = 1.2 inclina la galaxia hacia atrás (disco achatado)
        // Z = 0.3 le da la inclinación diagonal de la foto
        grupoGalaxia.rotation.x = 0.20; 
        grupoGalaxia.rotation.z = 0.3; 
        
        scene.add(grupoGalaxia);

        function animateGalaxia() {
            requestAnimationFrame(animateGalaxia);
            // La galaxia ahora gira sobre su propio eje Y, manteniendo la inclinación del Grupo
            points.rotation.y -= 0.003; 
            renderer.render(scene, camera);
        }
        animateGalaxia();
    }
    initGalaxy();

    // ── ESTRELLAS ──
    for (let i = 0; i < 80; i++) {
        const s = document.createElement("div");
        s.className = "estrella";
        const sz = Math.random() * 2.5 + 0.5;
        s.style.cssText = `width:${sz}px; height:${sz}px; top:${Math.random()*100}%; left:${Math.random()*100}%; animation-duration:${Math.random()*3+1.5}s; animation-delay:${Math.random()*3}s;`;
        cieloEst.appendChild(s);
    }

    // ── PÉTALOS FLOTANTES (DÍA) ──
    for (let i = 0; i < 14; i++) {
        const p = document.createElement("div");
        p.className = "petalo";
        const sz = Math.random() * 8 + 8;
        const drift = (Math.random() - 0.5) * 160;
        p.style.cssText = `width:${sz}px; height:${sz}px; left:${Math.random()*100}%; --drift:${drift}px; animation-duration:${Math.random()*8+10}s; animation-delay:${Math.random()*12}s;`;
        petalosBox.appendChild(p);
    }

    // ── LUCIÉRNAGAS (NOCHE) ──
    for (let i = 0; i < 12; i++) {
        const l = document.createElement("div");
        l.className = "luciernaga";
        const fx = (Math.random() - 0.5) * 140;
        const fy = (Math.random() - 0.5) * 140;
        l.style.cssText = `left:${Math.random()*100}%; top:${Math.random()*100}%; --fx:${fx}px; --fy:${fy}px; animation-duration:${Math.random()*4+5}s; animation-delay:${Math.random()*5}s;`;
        luciernagasBox.appendChild(l);
    }

    // ── DÍAS JUNTOS ──
    if (diasJuntos && !isNaN(FECHA_INICIO)) {
        const hoy = new Date();
        const dias = Math.max(0, Math.floor((hoy - FECHA_INICIO) / 86400000));
        diasJuntos.textContent = `${dias.toLocaleString('es-ES')} días juntos, y contando...`;
    }

    // ── RAMO INTERACTIVO ──
    if (ramoInteractivo) {
        ramoInteractivo.addEventListener("click", (e) => {
            e.stopPropagation();
            tooltipRamo.textContent = RAZONES[indiceRazon % RAZONES.length];
            indiceRazon++;
            tooltipRamo.classList.add("visible");
            ramoInteractivo.classList.remove("brillo");
            void ramoInteractivo.offsetWidth;
            ramoInteractivo.classList.add("brillo");
            lanzarPetalosRamo();
            clearTimeout(ramoInteractivo._tooltipTimer);
            ramoInteractivo._tooltipTimer = setTimeout(() => tooltipRamo.classList.remove("visible"), 2600);
        });
    }

    function lanzarPetalosRamo() {
        const rect = ramoInteractivo.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const colores = ['#C2185B', '#F48FB1', '#F5C842'];
        for (let i = 0; i < 8; i++) {
            const d = document.createElement("div");
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 50 + 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist - 20;
            d.style.cssText = `position:fixed; left:${cx}px; top:${cy}px; width:6px; height:6px; border-radius:0 100% 0 100%; background:${colores[Math.floor(Math.random()*colores.length)]}; pointer-events:none; z-index:999;`;
            document.body.appendChild(d);
            d.animate([
                { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(180deg)`, opacity: 0 }
            ], { duration: 700 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => d.remove(), 1100);
        }
    }

    // ── MODO NOCHE/DÍA ──
    btnTema.addEventListener("click", () => {
        modoNoche = !modoNoche;
        document.body.classList.toggle("modo-noche", modoNoche);
        if (modoNoche) {
            bgDia.classList.remove("active");
            bgNoche.classList.add("active");
            btnTema.textContent = "☀️ Modo Día";
        } else {
            bgNoche.classList.remove("active");
            bgDia.classList.add("active");
            btnTema.textContent = "🌙 Modo Noche";
        }
    });

    // ── TILT 3D ──
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;
    let prlxX = 0, prlxY = 0, cPrlxX = 0, cPrlxY = 0;

    window.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        tRotY =  x * 20;
        tRotX = -y * 20;

        if (sobreAbierto) {
            prlxX = x;
            prlxY = y;
        } else {
            prlxX = 0;
            prlxY = 0;
        }
    });

    (function tick() {
        cRotX += (tRotX - cRotX) * 0.15;
        cRotY += (tRotY - cRotY) * 0.15;
        tiltWrapper.style.transform = `rotateX(${cRotX}deg) rotateY(${cRotY}deg)`;

        // Parallax capas internas del sobre
        cPrlxX += (prlxX - cPrlxX) * 0.08;
        cPrlxY += (prlxY - cPrlxY) * 0.08;

        if (sobreAbierto) {
            const aletas = caraDorso.querySelectorAll(
                ".sobre-aleta-izq, .sobre-aleta-der, .sobre-aleta-inf, .sobre-aleta-sup"
            );
            aletas.forEach(a => {
                a.style.transform = `translate(${cPrlxX * -4}px, ${cPrlxY * -4}px)`;
            });
            caraDorso.style.setProperty("--prlx-x", `${cPrlxX * 8}px`);
            caraDorso.style.setProperty("--prlx-y", `${cPrlxY * 8}px`);
        } else {
            const aletas = caraDorso.querySelectorAll(
                ".sobre-aleta-izq, .sobre-aleta-der, .sobre-aleta-inf, .sobre-aleta-sup"
            );
            aletas.forEach(a => { a.style.transform = ""; });
            caraDorso.style.setProperty("--prlx-x", "0px");
            caraDorso.style.setProperty("--prlx-y", "0px");
        }
    // --- INICIO CÓDIGO MEJORA 2 Y 5 EN TICK LOOP ---
        
        // LERP para la Mejora 2 (Glare del mouse)
        currentGx += (targetGx - currentGx) * 0.1;
        currentGy += (targetGy - currentGy) * 0.1;
        carta.style.setProperty('--gx', `${currentGx}%`);
        carta.style.setProperty('--gy', `${currentGy}%`);

        // LERP y variables para la Mejora 5 (Sombra dinámica)
        if (sobreAbierto && carta.classList.contains("fuera")) {
            // Invertimos y escalamos los valores cRotX / cRotY para proyectar sombra opuesta a la inclinación
            const sdwX = (cRotY * -2); 
            const sdwY = 60 + (cRotX * 2); 
            carta.style.setProperty('--sdw-x', `${sdwX}px`);
            carta.style.setProperty('--sdw-y', `${sdwY}px`);
        } else {
            // Reset suave si la carta se guarda
            carta.style.setProperty('--sdw-x', `0px`);
            carta.style.setProperty('--sdw-y', `60px`);
        }
        // --- FIN CÓDIGO MEJORA 2 Y 5 ---
        requestAnimationFrame(tick);
    })();

    // ── LOGIN ──
    const dots = document.querySelectorAll(".login-dot");
    inputPass.addEventListener("input", () => {
        const len = inputPass.value.length;
        dots.forEach((d, i) => d.classList.toggle("activo", i < len));
        procesarPass();
    });

    function procesarPass() {
        const pass = inputPass.value.trim().toLowerCase();
        if (pass === PASS) {
            inputPass.disabled = true;
            estadoLogin.textContent = "Verificando identidad...";
            estadoLogin.style.color = "inherit";
            huellaBox.classList.add("escaneando");

            crearParticulasEscaner();

            setTimeout(() => {
                huellaBox.classList.remove("escaneando");
                huellaBox.classList.add("aprobado");
                estadoLogin.textContent = "¡Acceso concedido, mari! ❤";
                estadoLogin.style.color = "#22c55e";

                setTimeout(() => {
                    pantallaLogin.classList.add("oculto");
                    setTimeout(() => {
                        pantallaSobre.classList.remove("oculto");
                        setTimeout(() => {
                            sobre3d.classList.add("entrando");
                            setTimeout(() => sobre3d.classList.remove("entrando"), 1050);
                        }, 100);
                    }, 900);
                }, 1400);
            }, 2400);
        } else if (pass.length >= PASS.length) {
            huellaBox.classList.add("error");
            estadoLogin.textContent = "Contraseña incorrecta";
            estadoLogin.style.color = "#ef4444";
            setTimeout(() => {
                huellaBox.classList.remove("error");
                estadoLogin.style.color = "inherit";
            }, 800);
        }
    }

    function crearParticulasEscaner() {
        const container = document.getElementById("scan-particles");
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const p = document.createElement("div");
                p.style.cssText = `position:absolute; width:3px; height:3px; border-radius:50%; background:${Math.random() > 0.5 ? 'var(--rosa)' : 'var(--gold)'}; left:${Math.random()*90+5}%; top:${Math.random()*80+10}%; opacity:0; box-shadow:0 0 6px currentColor;`;
                container.appendChild(p);
                p.animate([{opacity:1, transform:'scale(1)'},{opacity:0,transform:`translate(${(Math.random()-0.5)*30}px,${(Math.random()-0.5)*30}px) scale(0)`}], {duration:800, fill:'forwards'});
                setTimeout(() => p.remove(), 900);
            }, i * 250);
        }
    }

   // ── ABRIR SOBRE ──
    function abrirSobreAnimacion(e) {
        if (e.target.closest(".btn-cerrar") || animando || sobreAbierto) return;

        sobreAbierto = true;
        animando     = true;
        caraDorso.style.backfaceVisibility = "visible";
        tiltWrapper.classList.add("cinematic-zoom");
        
        rotationBase -= 1980; 
        sobre3d.style.transition = 'transform 2.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 2.8s ease';
        sobre3d.style.transform = `rotateX(0deg) rotateY(${rotationBase}deg) translateY(0)`;

        setTimeout(() => {
            selloSobre.classList.add("roto");
            lanzarDestellosSello();

            setTimeout(() => {
                solapaSup.classList.add("abierta");
                
                setTimeout(() => {
                    carta.classList.add("fuera");
                    lanzarOndas();

                    // NUEVO: Se remueve cinematic-zoom para desbloquear el transform inyectado por el ratón
                    setTimeout(() => {
                        tiltWrapper.classList.remove("cinematic-zoom");
                    }, 600);

                    setTimeout(() => {
                        lanzarConfetiFisico();
                        escribirTexto();
                        animando = false;
                    }, 800);
                }, 400);
            }, 400);
        }, 2800);
    }

    // NUEVO: Dispara la animación tanto al dar clic con mouse como al tocar la pantalla
    sobre3d.addEventListener("click", abrirSobreAnimacion);
    sobre3d.addEventListener("touchstart", abrirSobreAnimacion, { passive: true });

    // ── LLAMADA DEL SOBRE (tiembla si hay inactividad) ──
    let inactividadTimer = null;
    let sobreLlamando = false;

    function iniciarTimerInactividad() {
        clearTimeout(inactividadTimer);
        inactividadTimer = setTimeout(() => {
            if (!sobreAbierto && !animando) {
                sobreLlamando = true;
                sobre3d.classList.add("llamando");
                setTimeout(() => {
                    sobre3d.classList.remove("llamando");
                    sobreLlamando = false;
                    iniciarTimerInactividad();
                }, 900);
            }
        }, 4000);
    }

    function resetearInactividad() {
        clearTimeout(inactividadTimer);
        sobre3d.classList.remove("llamando");
        sobreLlamando = false;
        if (!sobreAbierto) iniciarTimerInactividad();
    }

    pantallaSobre.addEventListener("mousemove", resetearInactividad);
    pantallaSobre.addEventListener("touchstart", resetearInactividad, { passive: true });
    pantallaSobre.addEventListener("click", resetearInactividad);

    const observadorSobre = new MutationObserver(() => {
        if (!pantallaSobre.classList.contains("oculto")) {
            iniciarTimerInactividad();
            observadorSobre.disconnect();
        }
    });
    observadorSobre.observe(pantallaSobre, { attributes: true, attributeFilter: ["class"] });

   // ── CERRAR SOBRE ──
    const cerrarCartaHandler = (e) => {
        if (!sobreAbierto) return;
        if (e.target.id === "texto-maquina" || e.target.closest("#texto-maquina") || e.target.closest(".firma-contenedor") || e.target.classList.contains("carta-texto")) return;
        cerrarSobreMecanica();
    };

    carta.addEventListener("click", cerrarCartaHandler);
    
    // Soporte explícito para pantallas táctiles (móviles) para evitar bugs de WebKit en 3D
    btnCerrar.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarSobreMecanica();
    });
    btnCerrar.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        cerrarSobreMecanica();
    }, { passive: true });

    function cerrarSobreMecanica() {
        if (animando) return;
        animando = true;
        
        clearInterval(typingInterval);
        textoMaquina.innerHTML = "";
        
        // Cambio clave: Removemos el hack de inline styles.
        // Ahora usamos la clase CSS "guardando" para que la carta baje con fluidez.
        carta.classList.remove("fuera");
        carta.classList.add("guardando"); 
        carta.classList.remove("escritura-terminada");
        detenerLatidoFirma(); 

        setTimeout(() => {
            carta.classList.remove("guardando"); // Se limpia para que pueda volver a abrirse
            solapaSup.classList.remove("abierta");
            
            setTimeout(() => {
                selloSobre.classList.remove("roto");
                tiltWrapper.classList.remove("cinematic-zoom");

                setTimeout(() => {
                    rotationBase += 1980;
                    sobre3d.style.transition = 'transform 2.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 2.8s ease';
                    sobre3d.style.transform = `rotateX(0deg) rotateY(${rotationBase}deg) translateY(0)`;

                    setTimeout(() => {
                        sobreAbierto = false;
                        animando = false;
                        caraDorso.style.backfaceVisibility = "hidden";
                        sobre3d.style.transition = ""; 
                    }, 2800);
                }, 500);
            }, 500);
        }, 800); // Este tiempo de 800ms empata exactamente con la nueva animación CSS
    }

    // ── MÁQUINA DE ESCRIBIR ──
    function escribirTexto() {
        // Efecto gota de tinta
        const gotaTinta = document.createElement("div");
        gotaTinta.className = "gota-tinta";
        textoMaquina.parentNode.insertBefore(gotaTinta, textoMaquina);
        setTimeout(() => gotaTinta.remove(), 500);

        textoMaquina.innerHTML = '<span class="cursor-maquina"></span>';
        let i = 0;
        typingInterval = setInterval(() => {
            if (i >= MENSAJE.length) { 
                clearInterval(typingInterval); 
                carta.classList.add("escritura-terminada");
                iniciarLatidoFirma(); 
                return; 
            }
            const char   = MENSAJE[i];
            const cursor = textoMaquina.querySelector(".cursor-maquina");
            if (char === "\n") {
                textoMaquina.insertBefore(document.createElement("br"), cursor);
            } else {
                const span = document.createElement("span");
                span.className = "char-trazo";
                span.textContent = char;
                textoMaquina.insertBefore(span, cursor);
                void span.offsetWidth;
                span.classList.add("char-visible");
            }
            textoMaquina.scrollTop = textoMaquina.scrollHeight; 
            i++;
        }, 75); 
    }

    // ── ❤️ CORAZONES CSS PURO (INFALIBLES, INYECTADOS AL BODY) ❤️ ──
    function iniciarLatidoFirma() {
        if (!corazonFirmaWrapper) return;
        setTimeout(() => {
            lanzarMiniCorazonFirma(1);
            latidoInterval = setInterval(() => lanzarMiniCorazonFirma(1), 1200);
        }, 180);
    }

    function detenerLatidoFirma() {
        clearInterval(latidoInterval);
    }

    function lanzarMiniCorazonFirma(cantidad = 1) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!corazonFirmaWrapper) return;

        const actuales = document.querySelectorAll(".particula-corazon-wrapper").length;
        if (actuales > 12) return; 

        const rect = corazonFirmaWrapper.getBoundingClientRect();
        const centroX = rect.left + rect.width / 2;
        const centroY = rect.top + rect.height / 2;

        const coloresDia = ['#C2185B', '#F48FB1', '#F5C842'];
        const coloresNoche = ['#FF8FC0', '#FF8FC0', '#FDE68A'];
        const paleta = modoNoche ? coloresNoche : coloresDia;

        for (let i = 0; i < cantidad; i++) {
            const wrapper = document.createElement("div");
            wrapper.className = "particula-corazon-wrapper";
            
            const color = paleta[Math.floor(Math.random() * paleta.length)];
            
            const svgHTML = `<svg viewBox="0 0 32 32" style="width:100%; height:100%; display:block; overflow:visible;"><path d="M16 28.5l-2.15-1.95C6.2 20.65 2 16.55 2 11.5 2 7.35 5.35 4 9.5 4c2.35 0 4.6.6 6.5 2.1C17.9 4.6 20.15 4 22.5 4c4.15 0 7.5 3.35 7.5 7.5 0 5.05-4.2 9.15-11.85 15.1L16 28.5z" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"/></svg>`;
            wrapper.innerHTML = svgHTML;

            const size = 12 + Math.random() * 10; 
            
            wrapper.style.cssText = `
                position: fixed;
                left: ${centroX - size / 2}px;
                top: ${centroY - size / 2}px;
                width: ${size}px;
                height: ${size}px;
                z-index: 99999;
                pointer-events: none;
                will-change: transform, opacity;
            `;

            document.body.appendChild(wrapper);

            const dx = (Math.random() - 0.5) * 60; 
            const dy = -(Math.random() * 60 + 50); 
            const rot = (Math.random() - 0.5) * 90; 

            wrapper.animate([
                { transform: 'translate(0,0) scale(0.5) rotate(0deg)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(${rot}deg)`, opacity: 0 }
            ], {
                duration: 1300 + Math.random() * 400,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });

            setTimeout(() => wrapper.remove(), 1800);
        }
    }

    if (corazonFirmaWrapper) {
        corazonFirmaWrapper.addEventListener("click", (e) => {
            e.stopPropagation(); 
            lanzarMiniCorazonFirma(4 + Math.floor(Math.random() * 3)); 
        });
    }

    // ── CONFETI FÍSICO 3D ──
    class Confeti3D {
        constructor() {
            this.element = document.createElement('div');
            this.element.classList.add('confeti-corazon');
            this.x = 0; this.y = 0; this.z = 0;
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = -Math.random() * 15 - 8;
            this.vz = (Math.random() - 0.5) * 20;
            this.rotX = Math.random() * 360; this.rotY = Math.random() * 360; this.rotZ = Math.random() * 360;
            this.vRotX = (Math.random() - 0.5) * 15; this.vRotY = (Math.random() - 0.5) * 15; this.vRotZ = (Math.random() - 0.5) * 25;
            this.gravedad = 0.4;
            this.opacity = 1;

            const colores = ['#FF5B6A', '#FFD36B', '#57C7AE'];
            this.element.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            this.element.style.left = '50%'; this.element.style.top = '40%';
            
            caraDorso.appendChild(this.element);
        }
        update() {
            this.vy += this.gravedad;
            this.x += this.vx; this.y += this.vy; this.z += this.vz;
            this.rotX += this.vRotX; this.rotY += this.vRotY; this.rotZ += this.vRotZ;
            this.opacity -= 0.012;
            this.element.style.transform = `translate3d(calc(-50% + ${this.x}px), calc(-50% + ${this.y}px), ${this.z}px) rotateX(${this.rotX}deg) rotateY(${this.rotY}deg) rotateZ(${this.rotZ}deg) scale(${Math.max(0, this.opacity)})`;
            this.element.style.opacity = Math.max(0, this.opacity);
            return this.opacity > 0;
        }
    }

    let arrayConfetis = [];
    function loopConfeti() {
        arrayConfetis = arrayConfetis.filter(c => {
            const vivo = c.update();
            if (!vivo) c.element.remove();
            return vivo;
        });
        if (arrayConfetis.length > 0) requestAnimationFrame(loopConfeti);
    }

    function lanzarConfetiFisico() {
        for (let i = 0; i < 35; i++) { arrayConfetis.push(new Confeti3D()); }
        requestAnimationFrame(loopConfeti);
    }

    function lanzarDestellosSello() {
        const rect = selloSobre.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;

        for (let i = 0; i < 14; i++) {
            const d = document.createElement("div");
            d.className = "destello";
            const angle = (i / 14) * Math.PI * 2;
            const dist  = Math.random() * 120 + 60;
            const dx    = Math.cos(angle) * dist;
            const dy    = Math.sin(angle) * dist;
            d.style.cssText = `left:${cx}px; top:${cy}px; --destello-end: translate(${dx}px, ${dy}px) scale(0); animation-duration:${Math.random()*0.5+0.4}s; background:${Math.random()>0.5 ? 'var(--gold)' : 'var(--rosa-light)'};`;
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 900);
        }
    }

    function lanzarOndas() {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const colores = ["rgba(245,200,66,0.5)", "rgba(194,24,91,0.3)"];
        colores.forEach((color, i) => {
            setTimeout(() => {
                const onda = document.createElement("div");
                onda.className = "onda-luz";
                onda.style.cssText = `left:${cx}px; top:${cy}px; border-color:${color}; border-width:${i===0?2:1}px;`;
                document.body.appendChild(onda);
                setTimeout(() => onda.remove(), 1300);
            }, i * 180);
        });
    }

});