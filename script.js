/* =========================================================
   PARA TI — RECUERDOS ESPECIALES
   script.js · Refactorizado
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       1. REFERENCIAS AL DOM
       ========================================================= */
    const pantallaLogin       = document.getElementById("pantalla-login");
    const contenedorPrincipal = document.getElementById("contenedor-principal");
    const inputPass            = document.getElementById("input-password");
    const huellaBox            = document.getElementById("huella-box");
    const estadoLogin          = document.getElementById("estado-login");
    const dots                 = document.querySelectorAll(".login-dot");
    const tiltWrapperCartas    = document.getElementById("tilt-wrapper-cartas");
    const navDots              = document.querySelectorAll(".nav-dot");

    const PASS_CORRECTA = "mari";
    const TOTAL_HOJAS   = 3;
    let   indiceActivo  = 0;

    /* =========================================================
       2. UTILIDADES GENERALES
       ========================================================= */

    /**
     * Devuelve una Promise que resuelve tras `ms` milisegundos.
     * Reemplaza todos los setTimeout anidados por await delay().
     */
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    /**
     * Motor de máquina de escribir basado en Promises.
     * Admite múltiples instancias simultáneas (un AbortController por instancia).
     * @param {string}  elementoId  - id del párrafo destino
     * @param {string}  texto       - cadena a escribir
     * @param {number}  velocidad   - ms por carácter (default 45)
     * @param {AbortSignal} signal  - señal de cancelación opcional
     */
    function escribirTexto(elementoId, texto, velocidad = 45, signal = null) {
        const parrafo = document.getElementById(elementoId);
        if (!parrafo || !texto) return Promise.resolve();

        parrafo.innerHTML = '<span class="cursor-escritura"></span>';

        return new Promise(resolve => {
            let i = 0;

            const tick = () => {
                // Si la señal fue abortada, limpiamos y salimos
                if (signal?.aborted) {
                    resolve();
                    return;
                }
                if (i >= texto.length) {
                    resolve();
                    return;
                }

                const cursor = parrafo.querySelector(".cursor-escritura");
                const span   = document.createElement("span");
                span.className   = "letra-trazo";
                span.textContent = texto[i];
                parrafo.insertBefore(span, cursor);
                void span.offsetWidth;          // fuerza reflow para la animación CSS
                span.classList.add("letra-visible");
                i++;

                setTimeout(tick, velocidad);
            };

            setTimeout(tick, velocidad);
        });
    }

    /* =========================================================
       3. ESTADO GLOBAL DE TARJETAS (sustituye variables sueltas)
       ========================================================= */
    const estado = {
        /* AbortControllers activos por tarjeta (para cancelar typewriters) */
        controllers: {},

        /* Flag de sorpresa para la tarjeta 2 */
        sorpresaIniciada: false,

        /** Cancela todos los controladores activos */
        cancelarTodo() {
            Object.values(this.controllers).forEach(ctrl => ctrl.abort());
            this.controllers = {};
        },

        /** Crea y almacena un nuevo controlador para la tarjeta dada */
        nuevoControlador(clave) {
            const ctrl = new AbortController();
            this.controllers[clave] = ctrl;
            return ctrl.signal;
        },
    };

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

    /* Keyframe de error inyectado una sola vez */
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
       5. PARALLAX 3D (motor de físicas con lerp)
       ========================================================= */
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;

    window.addEventListener("mousemove", e => {
        if (contenedorPrincipal.classList.contains("oculto")) return;
        tRotY =  (e.clientX / window.innerWidth  - 0.5) * 2 * 8;
        tRotX = -(e.clientY / window.innerHeight - 0.5) * 2 * 8;
    });

    (function renderPhysics() {
        cRotX += (tRotX - cRotX) * 0.08;
        cRotY += (tRotY - cRotY) * 0.08;
        if (tiltWrapperCartas && !tiltWrapperCartas.classList.contains("cartas-ocultas")) {
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

    /* Swipe táctil */
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

        // Limpiar textos de typewriter
        for (let i = 0; i < TOTAL_HOJAS; i++) {
            const p = document.getElementById(`texto-${i}`);
            if (p) p.innerHTML = "";
        }

        // Resetear sobre
        const sobre = document.getElementById("el-sobre");
        if (sobre) sobre.classList.remove("abierto");

        // Resetear escena tarjeta 2 (smartphone + sorpresa)
        resetearEscenaTarjeta2();
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

    /* ── Tarjeta 0: Sobre ── */
    function coreografiaSobre() {
        generarDestellosSobre();
    }

    /* ── Tarjeta 1: Telegrama ── */
    async function coreografiaTelegrama() {
        const signal = estado.nuevoControlador("telegrama");
        const MSG      = "Hemos compartido tantas risas y aventuras. Lo mejor de todo es que sé que nuestra historia apenas está comenzando.";
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

    /* ── Tarjeta 2: Smartphone con mensajes secuenciales ── */
    async function coreografiaSmartphone() {
        const signal = estado.nuevoControlador("smartphone");

        const sp             = document.getElementById("smartphone-3");
        const scrollContainer = document.getElementById("sp-messages");
        const msg1           = document.getElementById("msg-1");
        const msg2           = document.getElementById("msg-2");
        const msg3           = document.getElementById("msg-3");
        const typing         = document.getElementById("sp-typing");

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
       8. INTERACCIÓN DEL SOBRE (Tarjeta 0)
       ========================================================= */
    window.interactuarSobre = function (e) {
        const hoja = e.currentTarget.closest(".hoja");
        if (!hoja.classList.contains("active")) return;

        const sobre = document.getElementById("el-sobre");
        if (sobre && !sobre.classList.contains("abierto")) {
            sobre.classList.add("abierto");

            const signal = estado.nuevoControlador("sobre");
            delay(800).then(() => {
                if (!signal.aborted) {
                    escribirTexto(
                        "texto-0",
                        "Desde que llegaste a mi vida, cada pequeño instante a tu lado se ha convertido en mi recuerdo favorito.",
                        45,
                        signal
                    );
                }
            });
        }
    };


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

        // Secuencia de mensajes finales (async limpia)
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
    function generarPetalos() {
        const contenedor = document.getElementById("petalos-flotantes");
        if (!contenedor) return;

        const colores = [
            "linear-gradient(135deg, #f4a7b9, #e91e8c)",
            "linear-gradient(135deg, #ffb3c6, #ff4d88)",
            "linear-gradient(135deg, #fce4ec, #f06292)",
        ];

        for (let i = 0; i < 18; i++) {
            const p    = document.createElement("div");
            p.className = "petalo";
            const size  = Math.random() * 10 + 8;
            const left  = Math.random() * 110 - 5;
            const drift = (Math.random() - 0.5) * 160;
            const dur   = Math.random() * 10 + 12;
            const delay = Math.random() * -20;
            p.style.cssText = [
                `width: ${size}px`,
                `height: ${size * 0.75}px`,
                `left: ${left}%`,
                `background: ${colores[Math.floor(Math.random() * colores.length)]}`,
                `--drift: ${drift}px`,
                `animation-duration: ${dur}s`,
                `animation-delay: ${delay}s`,
            ].join("; ");
            contenedor.appendChild(p);
        }
    }

    function generarLuciernagas() {
        const contenedor = document.getElementById("luciernagas");
        if (!contenedor) return;

        const colores = ["#ff8fc0", "#ffc22e", "#ac82ff", "#17e8a4"];

        for (let i = 0; i < 22; i++) {
            const l     = document.createElement("div");
            l.className  = "luciernaga";
            const color = colores[Math.floor(Math.random() * colores.length)];
            const fx    = (Math.random() - 0.5) * 120;
            const fy    = (Math.random() - 0.5) * 80;
            const dur   = Math.random() * 5 + 4;
            const dly   = Math.random() * -8;
            l.style.cssText = [
                `left: ${Math.random() * 100}%`,
                `top: ${Math.random() * 100}%`,
                `background: ${color}`,
                `box-shadow: 0 0 8px 3px ${color}99, 0 0 16px 6px ${color}44`,
                `--fx: ${fx}px`,
                `--fy: ${fy}px`,
                `animation-duration: ${dur}s`,
                `animation-delay: ${dly}s`,
            ].join("; ");
            contenedor.appendChild(l);
        }
    }

    function generarDestellosSobre() {
        const contenedor = document.querySelector(".particulas-sobre");
        if (!contenedor) return;

        // Limpiar destellos previos antes de regenerar
        contenedor.querySelectorAll(".destello").forEach(el => el.remove());

        const simbolos = ["✦", "✧", "⋆", "✸", "✺", "❋", "✿"];
        const colores  = [
            "var(--accent-neon)", "var(--accent-warm)", "var(--accent-yellow)",
            "#ffb3c6", "#ffffff",
        ];

        for (let i = 0; i < 8; i++) {
            const d       = document.createElement("span");
            d.className   = "destello";
            d.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];

            const angle  = (i / 8) * 360;
            const radius = 55 + Math.random() * 40;
            const rad    = angle * (Math.PI / 180);
            const x      = Math.cos(rad) * radius + 120;
            const y      = Math.sin(rad) * radius + 80;

            d.style.cssText = [
                `left: ${x}px`,
                `top: ${y}px`,
                `--fx: ${(Math.random() - 0.5) * 18}px`,
                `--fy: ${-(Math.random() * 14 + 6)}px`,
                `--dur: ${(Math.random() * 2 + 2.5).toFixed(2)}s`,
                `--delay: -${(Math.random() * 2.5).toFixed(2)}s`,
                `--color: ${colores[Math.floor(Math.random() * colores.length)]}`,
            ].join("; ");

            contenedor.appendChild(d);
        }
    }

    function generarOrnamentosTelegrama() {
        const wrapper = document.querySelector(".telegrama-wrapper");
        if (!wrapper) return;

        // Evitar duplicados si se llama más de una vez
        if (wrapper.querySelector(".ornamento")) return;

        [
            { clase: "ornamento-tl", simbolo: "✦" },
            { clase: "ornamento-tr", simbolo: "✦" },
            { clase: "ornamento-bl", simbolo: "✦" },
            { clase: "ornamento-br", simbolo: "✦" },
        ].forEach(({ clase, simbolo }) => {
            const el       = document.createElement("div");
            el.className   = `ornamento ${clase}`;
            el.textContent = simbolo;
            wrapper.appendChild(el);
        });
    }

    function lanzarConfeti() {
        const contenedor = document.getElementById("hoja-2");
        if (!contenedor) return;

        const colores = ["#ff3d70", "#17e8a4", "#ffc22e", "#ac82ff", "#ffffff", "#e9e4dc"];

        for (let i = 0; i < 70; i++) {
            const confeti = document.createElement("div");
            confeti.className = "confeti-particle";
            confeti.style.left                = `${Math.random() * 100}%`;
            confeti.style.backgroundColor     = colores[Math.floor(Math.random() * colores.length)];
            confeti.style.animationDuration   = `${Math.random() * 2.5 + 2}s`;
            confeti.style.animationDelay      = `${Math.random() * 0.5}s`;
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
    generarDestellosSobre();
    generarPetalos();
    generarLuciernagas();

}); // fin DOMContentLoaded