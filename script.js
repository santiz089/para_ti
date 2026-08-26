/* =========================================================
   PARA TI — RECUERDOS ESPECIALES
   script.js · Refactorizado con Sobre 3D + Flecha Animada
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       1. REFERENCIAS AL DOM Y VARIABLES DE ESTADO
       ========================================================= */
    const pantallaLogin       = document.getElementById("pantalla-login");
    const contenedorPrincipal = document.getElementById("contenedor-principal");
    const inputPass            = document.getElementById("input-password");
    const huellaBox            = document.getElementById("huella-box");
    const estadoLogin          = document.getElementById("estado-login");
    const dots                 = document.querySelectorAll(".login-dot");
    const tiltWrapperCartas    = document.getElementById("tilt-wrapper-cartas");
    const navDots              = document.querySelectorAll(".nav-dot");

    // --- REFERENCIAS PARA EL SOBRE 3D ---
    const imageContainer = document.getElementById('sobre-flip'); 
    const sobreSquash    = document.getElementById('sobre-squash'); // Contenedor del aplastamiento
    const aleta          = document.getElementById('aleta-sup');
    const cartaInterior  = document.getElementById('carta-interior');
    const caraDorso      = document.getElementById('cara-dorso');
    const estrellasSobre = document.getElementById('estrellas-sobre');
    const fechaHoraEl    = document.getElementById('fecha-hora');
    const flechaSobre    = document.getElementById('flecha-sobre'); 

    let isFlipped = false;
    let isAnimating = false;
    let baseRotationY = 0;
    let flipTimeout;
    let typingIntervalDino;
    // -------------------------------------------

    const PASS_CORRECTA = "mari";
    const TOTAL_HOJAS   = 3;
    let   indiceActivo  = 0;

    /* =========================================================
       2. UTILIDADES GENERALES
       ========================================================= */
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    function escribirTexto(elementoId, texto, velocidad = 45, signal = null) {
        const parrafo = document.getElementById(elementoId);
        if (!parrafo || !texto) return Promise.resolve();

        parrafo.innerHTML = '<span class="cursor-escritura"></span>';

        return new Promise(resolve => {
            let i = 0;
            const tick = () => {
                if (signal?.aborted) { resolve(); return; }
                if (i >= texto.length) { resolve(); return; }

                const cursor = parrafo.querySelector(".cursor-escritura");
                const span   = document.createElement("span");
                span.className   = "letra-trazo";
                span.textContent = texto[i];
                parrafo.insertBefore(span, cursor);
                void span.offsetWidth; 
                span.classList.add("letra-visible");
                i++;
                setTimeout(tick, velocidad);
            };
            setTimeout(tick, velocidad);
        });
    }

    // --- FUNCIONES DE TEXTO PARA EL SOBRE ---
    function resetTextoDino() {
        clearInterval(typingIntervalDino);
        
        // 1. Limpiar el texto principal
        const p = document.getElementById('texto-0');
        if (p) p.innerHTML = "";
        
        // 2. CORRECCIÓN: Limpiar la firma, apagar latidos y ocultar globito
        const firma = document.getElementById("firma-typing");
        if (firma) firma.innerHTML = "";
        
        if (typeof detenerLatidoFirma === 'function') detenerLatidoFirma();
        
        const tooltipRamo = document.getElementById("tooltip-ramo");
        if (tooltipRamo) tooltipRamo.classList.remove("visible");
    }

    function escribirTextoDino() {
        resetTextoDino();
        const p = document.getElementById('texto-0');
        if (!p) return;

        if (fechaHoraEl) {
            const ahora = new Date();
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            fechaHoraEl.textContent = ahora.toLocaleDateString('es-MX', opcionesFecha);
        }

        p.innerHTML = '<span class="cursor-maquina"></span>';
        const texto = "Desde que llegaste a mi vida, cada pequeño instante a tu lado se ha convertido en mi recuerdo favorito.";
        let i = 0;
        
       typingIntervalDino = setInterval(async () => {
            if (i < texto.length) {
                const cursor = p.querySelector('.cursor-maquina');
                const charNode = document.createTextNode(texto.charAt(i));
                p.insertBefore(charNode, cursor);
                i++;
            } else {
                clearInterval(typingIntervalDino);
                
                // NUEVO: Disparar la firma y la interactividad al terminar
                const cartaInt = document.getElementById('carta-interior');
                if (cartaInt) cartaInt.classList.add("escritura-terminada");
                
                await escribirFirma();
                iniciarLatidoFirma();
            }
        }, 70);
    }
    // -----------------------------------------------

    /* =========================================================
       3. ESTADO GLOBAL DE TARJETAS
       ========================================================= */
    const estado = {
        controllers: {},
        sorpresaIniciada: false,
        cancelarTodo() {
            Object.values(this.controllers).forEach(ctrl => ctrl.abort());
            this.controllers = {};
        },
        nuevoControlador(clave) {
            const ctrl = new AbortController();
            this.controllers[clave] = ctrl;
            return ctrl.signal;
        },
    };
    /* =========================================================
       3.5 VARIABLES Y TYPEWRITER DEL LOGIN
       ========================================================= */
    const RAZONES = [
        "Por tu risa que me desarma 🌹",
        "Por cada detalle que nadie más nota 🌹",
        "Por ser mi lugar favorito 🌹",
        "Por hacer extraordinario lo cotidiano 🌹",
        "Por sorprenderme cada día 🌹",
        "Por ser mi historia favorita 🌹"
    ];
    let indiceRazon = 0;
    let latidoInterval;
    let textoFirmaCache = "Edgar"; // Guardamos el nombre por defecto

    // Typewriter para el título del Login
    const tituloLogin = document.getElementById("titulo-login");
    if (tituloLogin) {
        const textoTitulo = tituloLogin.textContent;
        tituloLogin.textContent = "";
        let charIndex = 0;
        
        // Ocultamos los controles al inicio
        inputPass.style.opacity = "0";
        estadoLogin.style.opacity = "0";
        document.getElementById("login-dots").style.opacity = "0";
        inputPass.disabled = true;

        function escribirTitulo() {
            if (charIndex < textoTitulo.length) {
                tituloLogin.textContent += textoTitulo[charIndex];
                charIndex++;
                setTimeout(escribirTitulo, 70); 
            } else {
                // Revelamos los controles suavemente
                inputPass.style.transition = "opacity 0.8s ease";
                estadoLogin.style.transition = "opacity 0.8s ease";
                document.getElementById("login-dots").style.transition = "opacity 0.8s ease";
                
                inputPass.style.opacity = "1";
                estadoLogin.style.opacity = "1";
                document.getElementById("login-dots").style.opacity = "1";
                inputPass.disabled = false;
            }
        }
        setTimeout(escribirTitulo, 500);
    }
    /* =========================================================
       4. LOGIN BIOMÉTRICO
       ========================================================= */
    inputPass.addEventListener("input", () => {
        const len = inputPass.value.length;
        dots.forEach((d, i) => d.classList.toggle("activo", i < len));
        procesarPassword();
    });

    async function procesarPassword() {
        const pass = inputPass.value.trim().toLowerCase();

        if (pass === PASS_CORRECTA) {
            inputPass.disabled = true;
            estadoLogin.textContent = "Desencriptando recuerdos...";
            estadoLogin.style.color = "#fff";
            huellaBox.classList.add("escaneando");

            await delay(2000);

            huellaBox.classList.remove("escaneando");
            huellaBox.classList.add("aprobado");
            estadoLogin.textContent = "¡Acceso concedido!";
            estadoLogin.style.color = "#17e8a4";

            await delay(1500);

            pantallaLogin.classList.add("oculto");
            contenedorPrincipal.classList.remove("oculto");

            await delay(500);

            tiltWrapperCartas.classList.remove("cartas-ocultas");
            ejecutarCoreografiaCarta(0);

        } else if (pass.length >= PASS_CORRECTA.length) {
            huellaBox.style.animation = "vibrarError 0.3s ease";
            estadoLogin.textContent  = "Llave incorrecta";
            estadoLogin.style.color  = "#ff3d70";

            await delay(800);

            huellaBox.style.animation = "";
            estadoLogin.style.color   = "var(--texto-secundario)";
            estadoLogin.textContent   = "Tú eres la llave mágica";
        }
    }

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes vibrarError {
            0%,  100% { transform: translateZ(50px) translateX(0); }
            25%        { transform: translateZ(50px) translateX(-8px); }
            75%        { transform: translateZ(50px) translateX(8px); }
        }
    `;
    document.head.appendChild(styleSheet);


    /* =========================================================
       5. PARALLAX 3D (MEJORADO PARA LOGIN)
       ========================================================= */
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;
    const tiltLogin = document.querySelector(".tilt-wrapper-login");

    window.addEventListener("mousemove", e => {
        const x = (e.clientX / window.innerWidth  - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        if (contenedorPrincipal.classList.contains("oculto")) {
            // Movimiento más amplio para el Login
            tRotY = x * 12;
            tRotX = -y * 12;
        } else {
            // Movimiento suave para las cartas
            tRotY = x * 8;
            tRotX = -y * 8;
        }
    });

    (function renderPhysics() {
        cRotX += (tRotX - cRotX) * 0.08;
        cRotY += (tRotY - cRotY) * 0.08;
        
        if (contenedorPrincipal.classList.contains("oculto") && tiltLogin) {
            tiltLogin.style.transform = `rotateX(${cRotX}deg) rotateY(${cRotY}deg)`;
        } else if (tiltWrapperCartas && !tiltWrapperCartas.classList.contains("cartas-ocultas")) {
            tiltWrapperCartas.style.transform = `rotateX(${cRotX}deg) rotateY(${cRotY}deg)`;
        }
        requestAnimationFrame(renderPhysics);
    })();


    /* =========================================================
       6. NAVEGACIÓN ENTRE TARJETAS
       ========================================================= */
    window.seleccionarTarjeta = function (indiceDestino) {
        if (indiceActivo === indiceDestino) return;
        indiceActivo = indiceDestino;

        navDots.forEach((dot, i) => dot.classList.toggle("active", i === indiceDestino));

        for (let i = 0; i < TOTAL_HOJAS; i++) {
            const hoja = document.getElementById(`hoja-${i}`);
            if (!hoja) continue;

            hoja.className = "hoja";
            const diff = (i - indiceDestino + TOTAL_HOJAS) % TOTAL_HOJAS;

            if      (diff === 0) hoja.classList.add("active");
            else if (diff === 1) hoja.classList.add("stacked-1");
            else if (diff === 2) hoja.classList.add("stacked-2");
        }

        ejecutarCoreografiaCarta(indiceDestino);
    };

    let touchStartX = 0, touchStartY = 0;
    const swipeEl = document.getElementById("tilt-wrapper-cartas");

    swipeEl.addEventListener("touchstart", e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    swipeEl.addEventListener("touchend", e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            seleccionarTarjeta(dx < 0
                ? (indiceActivo + 1) % TOTAL_HOJAS
                : (indiceActivo - 1 + TOTAL_HOJAS) % TOTAL_HOJAS
            );
        }
    }, { passive: true });


    /* =========================================================
       7. COREOGRAFÍAS DE CADA TARJETA
       ========================================================= */
    function limpiarAnimacionesAnteriores() {
        estado.cancelarTodo();

        // Limpiar textos de las tarjetas 1 y 2
        for (let i = 1; i < TOTAL_HOJAS; i++) {
            const p = document.getElementById(`texto-${i}`);
            if (p) p.innerHTML = "";
        }

        resetearSobreDino();
        resetearEscenaTarjeta2();
    }

    function resetearSobreDino() {
        isFlipped = false;
        isAnimating = false;
        baseRotationY = 0;
        clearTimeout(flipTimeout);
        if (imageContainer) {
            imageContainer.style.transition = "";
            imageContainer.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0)`;
        }
        // Limpiamos la clase del nuevo contenedor de squash
        if (sobreSquash) sobreSquash.classList.remove('sobre-aplastado');
        
        if (aleta) aleta.classList.remove('abierto', 'quebrandose', 'temblando');
        if (caraDorso) caraDorso.classList.remove('revelado');
        if (cartaInterior) cartaInterior.classList.remove('asomada');
        if (flechaSobre) flechaSobre.classList.remove('cayendo', 'oculta');
        resetTextoDino();

        // Limpiar estrellas acumuladas y regenerarlas frescas para la próxima apertura
        if (estrellasSobre) estrellasSobre.innerHTML = '';
        generarEstrellasSobre();
        const cartaInt = document.getElementById('carta-interior');
        if (cartaInt) cartaInt.classList.remove("escritura-terminada");
        if (typeof detenerLatidoFirma === 'function') detenerLatidoFirma();
    }

    function resetearEscenaTarjeta2() {
        estado.sorpresaIniciada = false;

        const sp = document.getElementById("smartphone-3");
        if (sp) {
            sp.classList.remove("vibrating");
            Object.assign(sp.style, { transition: "", transform: "", opacity: "", pointerEvents: "", display: "" });
            document.querySelectorAll(".sp-msg-item").forEach(el => el.classList.remove("show"));
            const scroll = document.getElementById("sp-messages");
            if (scroll) scroll.scrollTop = 0;
        }

        const btn = document.getElementById("btn-sorpresa");
        if (btn) {
            btn.classList.remove("show");
            Object.assign(btn.style, { opacity: "", pointerEvents: "", display: "" });
        }

        const escena = document.getElementById("escena-sorpresa");
        if (escena) {
            escena.classList.remove("activa");
            Object.assign(escena.style, { opacity: "", pointerEvents: "", zIndex: "" });

            const titulo = escena.querySelector(".mensaje-sorpresa");
            if (titulo) titulo.style.opacity = "1";

            document.querySelectorAll(".tarjeta-opcion").forEach(t => {
                t.classList.remove("seleccionada");
                Object.assign(t.style, { opacity: "1", transform: "", pointerEvents: "auto" });
            });

            document.querySelectorAll(".fade-mensaje").forEach(el => el.classList.remove("mostrar"));
            document.querySelectorAll(".te-quiero-typing").forEach(el => el.innerHTML = "");
        }
    }

    function ejecutarCoreografiaCarta(indice) {
        limpiarAnimacionesAnteriores();

        if      (indice === 0) coreografiaSobre();
        else if (indice === 1) coreografiaTelegrama();
        else if (indice === 2) coreografiaSmartphone();
    }

    function coreografiaSobre() {
        // Reservado por si quieres agregar algo al entrar la tarjeta 0
    }

    async function coreografiaTelegrama() {
        const signal = estado.nuevoControlador("telegrama");
        const MSG = "Hemos compartido tantas risas y aventuras. Lo mejor de todo es que sé que nuestra historia apenas está comenzando.";
        const VELOCIDAD = 42;

        await delay(600);
        if (signal.aborted) return;

        await escribirTexto("texto-1", MSG, VELOCIDAD, signal);
        if (signal.aborted) return;

        const selloWrap = document.querySelector(".sello-telegrama-wrap");
        if (selloWrap) {
            selloWrap.classList.add("sello-visible");
            await delay(700);
            if (!signal.aborted) selloWrap.classList.remove("sello-visible");
        }
    }

    async function coreografiaSmartphone() {
        const signal = estado.nuevoControlador("smartphone");

        const sp = document.getElementById("smartphone-3");
        const scrollContainer = document.getElementById("sp-messages");
        const msg1 = document.getElementById("msg-1");
        const msg2 = document.getElementById("msg-2");
        const msg3 = document.getElementById("msg-3");
        const typing = document.getElementById("sp-typing");

        if (!sp) return;

        const scrollDown = () => {
            if (scrollContainer) {
                setTimeout(() => { scrollContainer.scrollTop = scrollContainer.scrollHeight; }, 50);
            }
        };

        const mostrarMensaje = async (msgEl, esperaTyping = 1800) => {
            typing.classList.add("show");
            scrollDown();
            await delay(esperaTyping);
            if (signal.aborted) return;
            typing.classList.remove("show");
            msgEl.classList.add("show");
            sp.classList.add("vibrating");
            scrollDown();
            await delay(300);
            sp.classList.remove("vibrating");
        };

        await delay(800);
        if (signal.aborted) return;
        await mostrarMensaje(msg1, 2000);
        if (signal.aborted) return;
        await delay(1200);
        if (signal.aborted) return;
        await mostrarMensaje(msg2, 2500);
        if (signal.aborted) return;
        await delay(1200);
        if (signal.aborted) return;
        await mostrarMensaje(msg3, 1800);
        if (signal.aborted) return;
        await delay(1500);
        if (signal.aborted) return;

        const btn = document.getElementById("btn-sorpresa");
        if (btn) btn.classList.add("show");
    }


    /* =========================================================
       8. INTERACCIÓN DEL SOBRE 3D (Tarjeta 0)
       ========================================================= */
    if (imageContainer) {
        imageContainer.addEventListener('click', async (e) => {
            const hoja = e.currentTarget.closest(".hoja");
            if (!hoja || !hoja.classList.contains("active")) return;

            if (isAnimating) return;
            isAnimating = true;

            if (!isFlipped) {
                
                // Animar flecha cayendo
                if (flechaSobre) flechaSobre.classList.add('cayendo');

                // Flash de impacto al momento del golpe
                if (sobreSquash) {
                    const flash = document.createElement('div');
                    flash.classList.add('flash-impacto');
                    sobreSquash.appendChild(flash);
                    setTimeout(() => flash.remove(), 250);
                }
                
                // Aplastamiento en el contenedor EXTERNO para proteger el 3D
                if (sobreSquash) sobreSquash.classList.add('sobre-aplastado');
                
                // Esperar aplastamiento antes de lanzar el flip
                await new Promise(r => setTimeout(r, 580));
                
                if (sobreSquash) sobreSquash.classList.remove('sobre-aplastado');
                
                // Dejar la flecha oculta mientras el sobre está girado
                if (flechaSobre) flechaSobre.classList.add('oculta');

                // GIRAR Y ABRIR (Animación en el contenedor INTERNO)
                isFlipped = true;
                baseRotationY -= 1980;

                imageContainer.style.transition = 'transform 2.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 2.8s ease';
                imageContainer.style.transform = `rotateX(0deg) rotateY(${baseRotationY}deg) translateY(0)`;

                clearTimeout(flipTimeout);
                flipTimeout = setTimeout(() => {
                    isAnimating = false;
                    imageContainer.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';

                    if (aleta) aleta.classList.add('temblando', 'quebrandose');

                    setTimeout(() => {
                        if (aleta) {
                            aleta.classList.remove('temblando');
                            aleta.classList.add('abierto');
                        }
                        if (caraDorso) caraDorso.classList.add('revelado');

                        lanzarConfetiFisico();

                        const r = document.createElement('div');
                        r.className = 'rayo-luz';
                        if (caraDorso) caraDorso.appendChild(r);
                        setTimeout(() => r.remove(), 1300);

                        setTimeout(() => {
                            if (cartaInterior) cartaInterior.classList.add('asomada');
                            setTimeout(escribirTextoDino, 2200);
                        }, 400);
                    }, 400);

                }, 2800);

            } else {
                // CERRAR Y REVERTIR GIRO
                if (cartaInterior) {
                    cartaInterior.classList.remove('asomada');
                    // CORRECCIÓN: Quitamos la clase al instante para que la firma desaparezca suavemente
                    cartaInterior.classList.remove('escritura-terminada'); 
                }
                
                // Por precaución, cerramos el globito de flores si se quedó abierto
                const tooltipRamo = document.getElementById("tooltip-ramo");
                if (tooltipRamo) tooltipRamo.classList.remove("visible");

                setTimeout(resetTextoDino, 800);

                setTimeout(() => {
                    if (aleta) aleta.classList.remove('abierto', 'quebrandose');
                    if (caraDorso) caraDorso.classList.remove('revelado');

                    setTimeout(() => {
                        isFlipped = false;
                        baseRotationY += 1980;

                        imageContainer.style.transition = 'transform 2.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 2.8s ease';
                        imageContainer.style.transform = `rotateX(0deg) rotateY(${baseRotationY}deg) translateY(0)`;

                        clearTimeout(flipTimeout);
                        flipTimeout = setTimeout(() => {
                            isAnimating = false;
                            imageContainer.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
                            
                            // Mostrar la flecha nuevamente
                            if (flechaSobre) {
                                flechaSobre.classList.remove('cayendo', 'oculta');
                            }
                        }, 2800);

                    }, 500);
                }, 500);
            }
        });
    }


    /* =========================================================
       9. ESCENA SORPRESA (Tarjeta 2)
       ========================================================= */
    window.iniciarSorpresa = function (event) {
        if (event) {
            try { event.preventDefault(); event.stopPropagation(); } catch (_) {}
        }
        if (estado.sorpresaIniciada) return;
        estado.sorpresaIniciada = true;

        const sp    = document.getElementById("smartphone-3");
        const btn   = document.getElementById("btn-sorpresa");
        const escena = document.getElementById("escena-sorpresa");

        if (btn) {
            btn.classList.remove("show");
            Object.assign(btn.style, { opacity: "0", pointerEvents: "none" });
        }

        if (sp) {
            Object.assign(sp.style, {
                transition:    "transform 0.8s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease",
                transform:     "translateY(50px) scale(0.8)",
                opacity:       "0",
                pointerEvents: "none",
            });
            setTimeout(() => { sp.style.display = "none"; }, 600);
        }

        lanzarConfeti();

        if (escena) {
            setTimeout(() => {
                escena.classList.add("activa");
                Object.assign(escena.style, { opacity: "1", pointerEvents: "auto", zIndex: "100" });
            }, 500);
        }
    };

    window.revelarTarjeta = function (elementoClicado) {
        if (document.querySelector(".tarjeta-opcion.seleccionada")) return;

        document.querySelectorAll(".tarjeta-opcion").forEach(tarjeta => {
            if (tarjeta !== elementoClicado) {
                Object.assign(tarjeta.style, { opacity: "0", transform: "scale(0.8)", pointerEvents: "none" });
            }
        });

        const titulo = document.querySelector(".mensaje-sorpresa");
        if (titulo) titulo.style.opacity = "0";

        elementoClicado.classList.add("seleccionada");
        setTimeout(lanzarConfeti, 400);
        _secuenciaMensajesFinales(elementoClicado);
    };

    async function _secuenciaMensajesFinales(elementoClicado) {
        await delay(1000);
        const fadeMsgs    = elementoClicado.querySelectorAll(".fade-mensaje");
        const typingTarget = elementoClicado.querySelector(".te-quiero-typing");

        if (fadeMsgs[0]) fadeMsgs[0].classList.add("mostrar");
        await delay(800);
        if (fadeMsgs[1]) fadeMsgs[1].classList.add("mostrar");
        await delay(1000);

        if (typingTarget?.id) {
            await escribirTexto(typingTarget.id, "Te quiero", 120);
        }
    }


    /* =========================================================
       10. GENERADORES DE PARTÍCULAS
       ========================================================= */
       
    // --- CONFETI FÍSICO (Para el interior del sobre 3D) ---
    class Confeti3D {
        constructor() {
            this.element = document.createElement('div');
            this.element.classList.add('confeti-corazon');
            this.x = 0; this.y = 0; this.z = 0;
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = -Math.random() * 15 - 8;
            this.vz = (Math.random() - 0.5) * 20;
            this.rotX = Math.random() * 360;
            this.rotY = Math.random() * 360;
            this.rotZ = Math.random() * 360;
            this.vRotX = (Math.random() - 0.5) * 15;
            this.vRotY = (Math.random() - 0.5) * 15;
            this.vRotZ = (Math.random() - 0.5) * 25;
            this.gravedad = 0.4;
            this.opacity = 1;

            const colores = ['#FF5B6A', '#FFD36B', '#57C7AE'];
            this.element.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            this.element.style.left = '50%';
            this.element.style.top = '40%';
            this.element.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';

            if (caraDorso) caraDorso.appendChild(this.element);
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
    function loopConfetiFisico() {
        arrayConfetis = arrayConfetis.filter(c => {
            const vivo = c.update();
            if (!vivo) c.element.remove();
            return vivo;
        });
        if (arrayConfetis.length > 0) requestAnimationFrame(loopConfetiFisico);
    }

    function lanzarConfetiFisico() {
        for (let i = 0; i < 35; i++) {
            arrayConfetis.push(new Confeti3D());
        }
        requestAnimationFrame(loopConfetiFisico);
    }

    function generarEstrellasSobre() {
        if (!estrellasSobre) return;
        estrellasSobre.innerHTML = ''; // Limpiar antes de generar para evitar duplicados
        for (let i = 0; i < 10; i++) {
            const estrella = document.createElement('span');
            estrella.classList.add('estrella');
            estrella.textContent = '✦';
            estrella.style.left = `${8 + Math.random() * 84}%`;
            estrella.style.top = `${8 + Math.random() * 78}%`;
            estrella.style.fontSize = `${8 + Math.random() * 8}px`;
            estrella.style.animationDelay = `${Math.random() * 2.4}s`;
            estrellasSobre.appendChild(estrella);
        }
    }
    // ------------------------------------------------------

    function generarPetalos() {
        const contenedor = document.getElementById("petalos-flotantes");
        if (!contenedor) return;

        const colores = [
            "linear-gradient(135deg, #f4a7b9, #e91e8c)",
            "linear-gradient(135deg, #ffb3c6, #ff4d88)",
            "linear-gradient(135deg, #fce4ec, #f06292)",
        ];

        for (let i = 0; i < 18; i++) {
            const p = document.createElement("div");
            p.className = "petalo";
            const size = Math.random() * 10 + 8;
            const left = Math.random() * 110 - 5;
            const drift = (Math.random() - 0.5) * 160;
            const dur = Math.random() * 10 + 12;
            const delay = Math.random() * -20;
            p.style.cssText = [
                `width: ${size}px`, `height: ${size * 0.75}px`, `left: ${left}%`,
                `background: ${colores[Math.floor(Math.random() * colores.length)]}`,
                `--drift: ${drift}px`, `animation-duration: ${dur}s`, `animation-delay: ${delay}s`,
            ].join("; ");
            contenedor.appendChild(p);
        }
    }

    function generarLuciernagas() {
        const contenedor = document.getElementById("luciernagas");
        if (!contenedor) return;

        const colores = ["#ff8fc0", "#ffc22e", "#ac82ff", "#17e8a4"];

        for (let i = 0; i < 22; i++) {
            const l = document.createElement("div");
            l.className = "luciernaga";
            const color = colores[Math.floor(Math.random() * colores.length)];
            const fx = (Math.random() - 0.5) * 120;
            const fy = (Math.random() - 0.5) * 80;
            const dur = Math.random() * 5 + 4;
            const dly = Math.random() * -8;
            l.style.cssText = [
                `left: ${Math.random() * 100}%`, `top: ${Math.random() * 100}%`, `background: ${color}`,
                `box-shadow: 0 0 8px 3px ${color}99, 0 0 16px 6px ${color}44`,
                `--fx: ${fx}px`, `--fy: ${fy}px`, `animation-duration: ${dur}s`, `animation-delay: ${dly}s`,
            ].join("; ");
            contenedor.appendChild(l);
        }
    }

    function generarOrnamentosTelegrama() {
        const wrapper = document.querySelector(".telegrama-wrapper");
        if (!wrapper || wrapper.querySelector(".ornamento")) return;

        [ { clase: "ornamento-tl", simbolo: "✦" }, { clase: "ornamento-tr", simbolo: "✦" },
          { clase: "ornamento-bl", simbolo: "✦" }, { clase: "ornamento-br", simbolo: "✦" },
        ].forEach(({ clase, simbolo }) => {
            const el = document.createElement("div");
            el.className = `ornamento ${clase}`;
            el.textContent = simbolo;
            wrapper.appendChild(el);
        });
    }

    // Confeti original de la sorpresa (Tarjetas A, B, C)
    function lanzarConfeti() {
        const contenedor = document.getElementById("hoja-2");
        if (!contenedor) return;

        const colores = ["#ff3d70", "#17e8a4", "#ffc22e", "#ac82ff", "#ffffff", "#e9e4dc"];

        for (let i = 0; i < 70; i++) {
            const confeti = document.createElement("div");
            confeti.className = "confeti-particle";
            confeti.style.left = `${Math.random() * 100}%`;
            confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            confeti.style.animationDuration = `${Math.random() * 2.5 + 2}s`;
            confeti.style.animationDelay = `${Math.random() * 0.5}s`;
            contenedor.appendChild(confeti);
            setTimeout(() => confeti.remove(), 4000);
        }
    }


    /* =========================================================
       11. BOTÓN MODO NOCHE / DÍA
       ========================================================= */
    const btnTema = document.getElementById("btn-tema");
    if (btnTema) {
        btnTema.addEventListener("click", () => {
            const esNoche = document.body.classList.toggle("modo-noche");
            btnTema.textContent = esNoche ? "☀️ Modo Día" : "🌙 Modo Noche";
        });
    }

    /* =========================================================
       12. INICIALIZACIÓN
       ========================================================= */
    generarOrnamentosTelegrama();
    generarEstrellasSobre(); 
    generarPetalos();
    generarLuciernagas();
    /* =========================================================
       13. INTERACTIVIDAD DE LA FIRMA (FLORES Y CORAZÓN SVG)
       ========================================================= */
       
    async function escribirFirma() {
        const firma = document.getElementById("firma-typing");
        if (!firma) return;
        
        // Guardamos el texto original por si el usuario abre y cierra la carta varias veces
        if (firma.textContent && !firma.querySelector('.cursor-escritura')) {
            textoFirmaCache = firma.textContent;
        }
        
        firma.innerHTML = "";
        await escribirTexto("firma-typing", textoFirmaCache, 120);
    }

    // ── FLORES INTERACTIVAS ──
    const ramoInteractivo = document.getElementById("ramo-interactivo");
    const tooltipRamo = document.getElementById("tooltip-ramo");
    let tooltipTimer;

    function activarRamo(e) {
        e.stopPropagation();
        
        // Si el usuario toca la pantalla, evitamos el menú de "guardar imagen"
        if (e.type === 'touchstart') {
            e.preventDefault(); 
        }

        if (tooltipRamo) {
            tooltipRamo.textContent = RAZONES[indiceRazon % RAZONES.length];
            indiceRazon++;
            tooltipRamo.classList.add("visible");
        }
        
        ramoInteractivo.classList.remove("brillo");
        void ramoInteractivo.offsetWidth; // Forzar reflow
        ramoInteractivo.classList.add("brillo");
        
        clearTimeout(tooltipTimer);
        tooltipTimer = setTimeout(() => {
            if (tooltipRamo) tooltipRamo.classList.remove("visible");
        }, 2600);
    }

    if (ramoInteractivo) {
        // Escuchamos tanto clics de computadora como toques directos de móvil
        ramoInteractivo.addEventListener("click", activarRamo);
        ramoInteractivo.addEventListener("touchstart", activarRamo, { passive: false });
    }

    // ── CORAZÓN INTERACTIVO SVG ──
    const corazonFirmaWrapper = document.getElementById("corazon-firma-wrapper");

    window.iniciarLatidoFirma = function() {
        if (!corazonFirmaWrapper) return;
        setTimeout(() => {
            lanzarMiniCorazonFirma(1);
            latidoInterval = setInterval(() => lanzarMiniCorazonFirma(1), 1200);
        }, 180);
    }

    window.detenerLatidoFirma = function() {
        clearInterval(latidoInterval);
    }

    function lanzarMiniCorazonFirma(cantidad = 1) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !corazonFirmaWrapper) return;

        // Límite de corazones para no saturar memoria en móviles
        const actuales = document.querySelectorAll(".particula-corazon-wrapper").length;
        if (actuales > 12) return; 

        const rect = corazonFirmaWrapper.getBoundingClientRect();
        const centroX = rect.left + rect.width / 2;
        const centroY = rect.top + rect.height / 2;
        const colores = ['#ff3d70', '#ff6b95', '#ffb3c6'];

        for (let i = 0; i < cantidad; i++) {
            const wrapper = document.createElement("div");
            wrapper.className = "particula-corazon-wrapper";
            const color = colores[Math.floor(Math.random() * colores.length)];
            
            wrapper.innerHTML = `<svg viewBox="0 0 32 32" style="width:100%; height:100%; display:block; overflow:visible;"><path d="M16 28.5l-2.15-1.95C6.2 20.65 2 16.55 2 11.5 2 7.35 5.35 4 9.5 4c2.35 0 4.6.6 6.5 2.1C17.9 4.6 20.15 4 22.5 4c4.15 0 7.5 3.35 7.5 7.5 0 5.05-4.2 9.15-11.85 15.1L16 28.5z" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"/></svg>`;

            const size = 12 + Math.random() * 10; 
            
            wrapper.style.cssText = `
                position: fixed; left: ${centroX - size / 2}px; top: ${centroY - size / 2}px;
                width: ${size}px; height: ${size}px; z-index: 99999;
                pointer-events: none; will-change: transform, opacity;
            `;

            document.body.appendChild(wrapper);

            const dx = (Math.random() - 0.5) * 60; 
            const dy = -(Math.random() * 60 + 50); 
            const rot = (Math.random() - 0.5) * 90; 

            wrapper.animate([
                { transform: 'translate(0,0) scale(0.5) rotate(0deg)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(${rot}deg)`, opacity: 0 }
            ], { duration: 1300 + Math.random() * 400, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'forwards' });

            setTimeout(() => wrapper.remove(), 1800);
        }
    }

    if (corazonFirmaWrapper) {
        function activarCorazonFirma(e) {
            e.stopPropagation(); 
            if (e.type === 'touchstart') e.preventDefault();
            lanzarMiniCorazonFirma(4 + Math.floor(Math.random() * 3)); 
        }
        
        corazonFirmaWrapper.addEventListener("click", activarCorazonFirma);
        corazonFirmaWrapper.addEventListener("touchstart", activarCorazonFirma, { passive: false });
    }
}); // fin DOMContentLoaded
