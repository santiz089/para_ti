document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       1. VARIABLES GLOBALES Y REFERENCIAS AL DOM
       ========================================================= */
    const pantallaLogin = document.getElementById("pantalla-login");
    const contenedorPrincipal = document.getElementById("contenedor-principal");
    const inputPass = document.getElementById("input-password");
    const huellaBox = document.getElementById("huella-box");
    const estadoLogin = document.getElementById("estado-login");
    const dots = document.querySelectorAll(".login-dot");
    const tiltWrapperCartas = document.getElementById("tilt-wrapper-cartas");
    const navDots = document.querySelectorAll(".nav-dot");
    
    const PASS_CORRECTA = "mari"; 
    let indiceActivo = 0;
    const totalHojas = 3; 
    
    let currentTypewriter = null;

    /* =========================================================
       2. LÓGICA DEL LOGIN BIOMÉTRICO (INTOCABLE)
       ========================================================= */
    inputPass.addEventListener("input", () => {
        const len = inputPass.value.length;
        dots.forEach((d, i) => d.classList.toggle("activo", i < len));
        procesarPassword();
    });

    function procesarPassword() {
        const pass = inputPass.value.trim().toLowerCase();
        
        if (pass === PASS_CORRECTA) {
            inputPass.disabled = true;
            estadoLogin.textContent = "Desencriptando recuerdos...";
            estadoLogin.style.color = "#fff";
            huellaBox.classList.add("escaneando");

            setTimeout(() => {
                huellaBox.classList.remove("escaneando");
                huellaBox.classList.add("aprobado");
                estadoLogin.textContent = "¡Acceso concedido!";
                estadoLogin.style.color = "#17e8a4";

                setTimeout(() => {
                    pantallaLogin.classList.add("oculto");
                    contenedorPrincipal.classList.remove("oculto");
                    
                    // Transición cinemática de entrada para las tarjetas
                    setTimeout(() => {
                        tiltWrapperCartas.classList.remove("cartas-ocultas");
                        ejecutarCoreografiaCarta(0);
                    }, 500);
                    
                }, 1500);
            }, 2000);
            
        } else if (pass.length >= PASS_CORRECTA.length) {
            huellaBox.style.animation = "vibrarError 0.3s ease";
            estadoLogin.textContent = "Llave incorrecta";
            estadoLogin.style.color = "#ff3d70";
            
            setTimeout(() => {
                huellaBox.style.animation = "";
                estadoLogin.style.color = "var(--texto-secundario)";
                estadoLogin.textContent = "Tú eres la llave mágica";
            }, 800);
        }
    }

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `@keyframes vibrarError { 0%, 100% { transform: translateZ(50px) translateX(0); } 25% { transform: translateZ(50px) translateX(-8px); } 75% { transform: translateZ(50px) translateX(8px); } }`;
    document.head.appendChild(styleSheet);


    /* =========================================================
       3. MOTOR DE FÍSICAS (PARALLAX 3D)
       ========================================================= */
    let tRotX = 0, tRotY = 0, cRotX = 0, cRotY = 0;

    window.addEventListener("mousemove", (e) => {
        if (contenedorPrincipal.classList.contains("oculto")) return;
        
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        tRotY = x * 8; 
        tRotX = -y * 8;
    });

    (function renderPhysics() {
        cRotX += (tRotX - cRotX) * 0.08;
        cRotY += (tRotY - cRotY) * 0.08;
        if(tiltWrapperCartas && !tiltWrapperCartas.classList.contains("cartas-ocultas")) {
            tiltWrapperCartas.style.transform = `rotateX(${cRotX}deg) rotateY(${cRotY}deg)`;
        }
        requestAnimationFrame(renderPhysics);
    })();


    /* =========================================================
       4. PILA ISOMÉTRICA DE CARTAS Y NAVEGACIÓN
       ========================================================= */
    window.seleccionarTarjeta = function(indiceDestino) {
        if (indiceActivo === indiceDestino) return; 
        indiceActivo = indiceDestino;

        // Actualizar Puntos
        navDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === indiceDestino);
        });

        // Actualizar Z-Index Stack Isométrico
        for (let i = 0; i < totalHojas; i++) {
            const hoja = document.getElementById(`hoja-${i}`);
            if(!hoja) continue;
            
            hoja.className = 'hoja'; // Reseteo limpio
            
            // Lógica de distancia relativa para la pila
            let diff = (i - indiceDestino + totalHojas) % totalHojas;
            
            if (diff === 0) {
                hoja.classList.add('active');
            } else if (diff === 1) {
                hoja.classList.add('stacked-1');
            } else if (diff === 2) {
                hoja.classList.add('stacked-2');
            }
        }

        ejecutarCoreografiaCarta(indiceDestino);
    };

    /* Swipe táctil básico */
    let touchStartX = 0;
    let touchStartY = 0;
    document.getElementById('tilt-wrapper-cartas').addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.getElementById('tilt-wrapper-cartas').addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            if (dx < 0) { // Swipe izquierda -> Siguiente
                seleccionarTarjeta((indiceActivo + 1) % totalHojas);
            } else { // Swipe derecha -> Anterior
                seleccionarTarjeta((indiceActivo - 1 + totalHojas) % totalHojas);
            }
        }
    }, { passive: true });


    /* =========================================================
       5. COREOGRAFÍAS ESPECÍFICAS DE CADA TARJETA
       ========================================================= */

function ejecutarCoreografiaCarta(indice) {
    limpiarAnimacionesAnteriores();

    if (indice === 0) {
        generarDestellosSobre();
    }
    else if (indice === 1) {
        const MSG = "Hemos compartido tantas risas y aventuras. Lo mejor de todo es que sé que nuestra historia apenas está comenzando.";
        const VELOCIDAD = 42; 

        setTimeout(() => {
            escribirTexto('texto-1', MSG, VELOCIDAD);

            const tiempoTypewriter = MSG.length * VELOCIDAD;
            setTimeout(() => {
                const selloWrap = document.querySelector('.sello-telegrama-wrap');
                if (selloWrap) {
                    selloWrap.classList.add('sello-visible');
                    setTimeout(() => selloWrap.classList.remove('sello-visible'), 700);
                }
            }, tiempoTypewriter);
        }, 600);
    }
    else if (indice === 2) {
        const sp = document.getElementById('smartphone-3');
        const scrollContainer = document.getElementById('sp-messages');
        const msg1 = document.getElementById('msg-1');
        const msg2 = document.getElementById('msg-2');
        const msg3 = document.getElementById('msg-3');
        const typing = document.getElementById('sp-typing');

        if (!sp) return;

        const scrollDown = () => {
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }, 50);
            }
        };

        setTimeout(() => {
            typing.classList.add('show');
            scrollDown();

            setTimeout(() => {
                typing.classList.remove('show');
                msg1.classList.add('show');
                sp.classList.add('vibrating');
                scrollDown();
                setTimeout(() => sp.classList.remove('vibrating'), 300);

                setTimeout(() => {
                    typing.classList.add('show');
                    scrollDown();

                    setTimeout(() => {
                        typing.classList.remove('show');
                        msg2.classList.add('show');
                        sp.classList.add('vibrating');
                        scrollDown();
                        setTimeout(() => sp.classList.remove('vibrating'), 300);

                        setTimeout(() => {
                            typing.classList.add('show');
                            scrollDown();

                            setTimeout(() => {
                                typing.classList.remove('show');
                                msg3.classList.add('show');
                                sp.classList.add('vibrating');
                                scrollDown();
                                setTimeout(() => sp.classList.remove('vibrating'), 300);

                                setTimeout(() => {
                                    const btn = document.getElementById('btn-sorpresa');
                                    if (btn) btn.classList.add('show');
                                }, 1500);

                            }, 1800);
                        }, 1200);
                    }, 2500);
                }, 2000);
            }, 2000);
        }, 800);
    }
}
function limpiarAnimacionesAnteriores() {
    if (currentTypewriter) clearInterval(currentTypewriter);
    
    for (let i = 0; i < totalHojas; i++) {
        const parrafo = document.getElementById(`texto-${i}`);
        if (parrafo) parrafo.innerHTML = "";
    }
    
    const sobre = document.getElementById('el-sobre');
    if (sobre) sobre.classList.remove('abierto');

    // Restablecer el seguro anti-bugs
    window.sorpresaIniciada = false;
    
    const sp = document.getElementById('smartphone-3');
    if (sp) {
        sp.classList.remove('vibrating');
        sp.removeAttribute('style'); // <-- Limpia el ocultamiento forzado
        document.querySelectorAll('.sp-msg-item').forEach(el => el.classList.remove('show'));
        const scrollContainer = document.getElementById('sp-messages');
        if (scrollContainer) scrollContainer.scrollTop = 0;
    }

    const btn = document.getElementById('btn-sorpresa');
    if (btn) {
        btn.classList.remove('show');
        btn.removeAttribute('style'); // <-- Lo vuelve a hacer visible
    }

    const escena = document.getElementById('escena-sorpresa');
    if (escena) {
        escena.classList.remove('activa');
        escena.removeAttribute('style'); // <-- Restaura la escena
        const titulo = escena.querySelector('.mensaje-sorpresa');
        if (titulo) titulo.style.opacity = '1';
        
        document.querySelectorAll('.tarjeta-opcion').forEach(t => {
            t.classList.remove('seleccionada');
            t.style.opacity = '1';
            t.style.transform = '';
            t.style.pointerEvents = 'auto';
        });
    }
}

/* Interacción Tarjeta 1: Abrir el Sobre */
    window.interactuarSobre = function(e) {
        // Solo interactúa si la tarjeta es la activa (evita abrirla desde atrás)
        const hoja = e.currentTarget.closest('.hoja');
        if (!hoja.classList.contains('active')) return;
        
        const sobre = document.getElementById('el-sobre');
        if (sobre && !sobre.classList.contains('abierto')) {
            sobre.classList.add('abierto');
            // Retraso para dejar que la solapa se abra y el papel suba
            setTimeout(() => {
                escribirTexto('texto-0', "Desde que llegaste a mi vida, cada pequeño instante a tu lado se ha convertido en mi recuerdo favorito.", 45);
            }, 800);
        }
    };

    /* Motor del efecto de máquina de escribir */
    function escribirTexto(elementoId, textoString, velocidad = 45) {
        const parrafo = document.getElementById(elementoId);
        if (!parrafo || !textoString) return;

        parrafo.innerHTML = '<span class="cursor-escritura"></span>';
        let charIndex = 0;

        currentTypewriter = setInterval(() => {
            if (charIndex >= textoString.length) {
                clearInterval(currentTypewriter);
                return;
            }
            const char = textoString[charIndex];
            const cursor = parrafo.querySelector(".cursor-escritura");
            const span = document.createElement("span");
            span.className = "letra-trazo";
            span.textContent = char;
            
            parrafo.insertBefore(span, cursor);
            void span.offsetWidth; 
            span.classList.add("letra-visible");
            charIndex++;
        }, velocidad); 
    }


    /* =========================================================
       6. GENERADOR DE PARTÍCULAS (Pétalos y Luciérnagas)
       ========================================================= */
    function generarPetalos() {
        const contenedor = document.getElementById('petalos-flotantes');
        if (!contenedor) return;
        const coloresPetalo = ['linear-gradient(135deg, #f4a7b9, #e91e8c)', 'linear-gradient(135deg, #ffb3c6, #ff4d88)', 'linear-gradient(135deg, #fce4ec, #f06292)'];
        for (let i = 0; i < 18; i++) {
            const p = document.createElement('div');
            p.className = 'petalo';
            const size = Math.random() * 10 + 8;
            const left = Math.random() * 110 - 5;
            const drift = (Math.random() - 0.5) * 160;
            const dur = Math.random() * 10 + 12;
            const delay = Math.random() * -20;
            p.style.cssText = `width: ${size}px; height: ${size * 0.75}px; left: ${left}%; background: ${coloresPetalo[Math.floor(Math.random() * coloresPetalo.length)]}; --drift: ${drift}px; animation-duration: ${dur}s; animation-delay: ${delay}s;`;
            contenedor.appendChild(p);
        }

    }

    function generarLuciernagas() {
        const contenedor = document.getElementById('luciernagas');
        if (!contenedor) return;
        const colores = ['#ff8fc0', '#ffc22e', '#ac82ff', '#17e8a4'];
        for (let i = 0; i < 22; i++) {
            const l = document.createElement('div');
            l.className = 'luciernaga';
            const color = colores[Math.floor(Math.random() * colores.length)];
            const fx = (Math.random() - 0.5) * 120;
            const fy = (Math.random() - 0.5) * 80;
            const dur = Math.random() * 5 + 4;
            const delay = Math.random() * -8;
            l.style.cssText = `left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; background: ${color}; box-shadow: 0 0 8px 3px ${color}99, 0 0 16px 6px ${color}44; --fx: ${fx}px; --fy: ${fy}px; animation-duration: ${dur}s; animation-delay: ${delay}s;`;
            contenedor.appendChild(l);
        }
    }


function generarDestellosSobre() {
    const contenedor = document.querySelector('.particulas-sobre');
    if (!contenedor) return;

    const simbolos = ['✦', '✧', '⋆', '✸', '✺', '❋', '✿'];
    const colores  = [
        'var(--accent-neon)',
        'var(--accent-warm)',
        'var(--accent-yellow)',
        '#ffb3c6',
        '#ffffff'
    ];

    for (let i = 0; i < 8; i++) {
        const d = document.createElement('span');
        d.className = 'destello';
        d.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];

        const angle    = (i / 8) * 360;
        const radius   = 55 + Math.random() * 40; // px desde el centro
        const rad      = angle * (Math.PI / 180);
        const x        = Math.cos(rad) * radius + 120; // offset al centro del sobre
        const y        = Math.sin(rad) * radius + 80;

        const fx       = (Math.random() - 0.5) * 18;
        const fy       = -(Math.random() * 14 + 6);
        const dur      = (Math.random() * 2 + 2.5).toFixed(2);
        const delay    = -(Math.random() * dur).toFixed(2);
        const color    = colores[Math.floor(Math.random() * colores.length)];

        d.style.cssText = `
            left: ${x}px;
            top:  ${y}px;
            --fx:    ${fx}px;
            --fy:    ${fy}px;
            --dur:   ${dur}s;
            --delay: ${delay}s;
            --color: ${color};
        `;

        contenedor.appendChild(d);
    }
}

function generarOrnamentosTelegrama() {
    const wrapper = document.querySelector('.telegrama-wrapper');
    if (!wrapper) return;
 
    const posiciones = [
        { clase: 'ornamento-tl', simbolo: '✦' },
        { clase: 'ornamento-tr', simbolo: '✦' },
        { clase: 'ornamento-bl', simbolo: '✦' },
        { clase: 'ornamento-br', simbolo: '✦' },
    ];
 
    posiciones.forEach(({ clase, simbolo }) => {
        const el = document.createElement('div');
        el.className = `ornamento ${clase}`;
        el.textContent = simbolo;
        wrapper.appendChild(el);
    });
}


// Llamar al cargar:
generarOrnamentosTelegrama();
// Llamar al cargar
generarDestellosSobre();
    generarPetalos();
    generarLuciernagas();

/* =========================================================
   NUEVA FUNCIONALIDAD: LA SORPRESA (Tarjetas Elegantes)
   ========================================================= */

window.iniciarSorpresa = function(event) {
    // 1. Evitar propagación
    if (event) {
        try { event.preventDefault(); event.stopPropagation(); } catch(e){}
    }

    // 2. Seguro anti-doble clic (evita el bug del event listener duplicado)
    if (window.sorpresaIniciada) return;
    window.sorpresaIniciada = true;

    const sp = document.getElementById('smartphone-3');
    const btn = document.getElementById('btn-sorpresa');
    const escena = document.getElementById('escena-sorpresa');

    // 3. Forzar la desaparición del celular de forma nativa e infalible
    if (sp) {
        sp.setAttribute("style", "transition: all 0.6s ease !important; opacity: 0 !important; transform: scale(0.8) translateY(50px) !important; pointer-events: none !important;");
        
        // Respaldo de seguridad: quitarlo físicamente del flujo tras la transición
        setTimeout(() => { sp.style.display = "none"; }, 600);
    }
    
    // 4. Ocultar el botón por completo
    if (btn) btn.style.display = "none";

    // 5. Lanzar el confeti
    lanzarConfeti();

    // 6. Mostrar la escena de tarjetas con prioridad absoluta
    if (escena) {
        setTimeout(() => {
            escena.classList.add('activa');
            escena.setAttribute("style", "opacity: 1 !important; pointer-events: auto !important; z-index: 999 !important;");
        }, 500);
    }
};

window.revelarTarjeta = function(elementoClicado) {
    // Evitar interacciones si ya se eligió una
    if (document.querySelector('.tarjeta-opcion.seleccionada')) return;

    // 1. Ocultar las tarjetas no seleccionadas
    const todasLasTarjetas = document.querySelectorAll('.tarjeta-opcion');
    todasLasTarjetas.forEach(tarjeta => {
        if (tarjeta !== elementoClicado) {
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'scale(0.8)';
            tarjeta.style.pointerEvents = 'none';
        }
    });

    // 2. Ocultar el título
    const titulo = document.querySelector('.mensaje-sorpresa');
    if(titulo) titulo.style.opacity = '0';

    // 3. Animar la tarjeta seleccionada
    elementoClicado.classList.add('seleccionada');
    
    // Disparar un poco más de confeti para celebrar la elección
    setTimeout(lanzarConfeti, 400);
};

function lanzarConfeti() {
    const contenedor = document.getElementById('hoja-2');
    if (!contenedor) return;

    const colores = ['#ff3d70', '#17e8a4', '#ffc22e', '#ac82ff', '#ffffff', '#e9e4dc'];

    for (let i = 0; i < 70; i++) {
        const confeti = document.createElement('div');
        confeti.className = 'confeti-particle';
        
        // Posición horizontal aleatoria
        confeti.style.left = Math.random() * 100 + '%';
        // Color aleatorio
        confeti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        // Duración y retraso aleatorios para que no caigan todos al mismo tiempo
        confeti.style.animationDuration = (Math.random() * 2.5 + 2) + 's';
        confeti.style.animationDelay = (Math.random() * 0.5) + 's';
        
        contenedor.appendChild(confeti);

        // Limpiar el DOM después de que termine la animación
        setTimeout(() => confeti.remove(), 4000);
    }
}
// Conectar el clic del botón con la función de la sorpresa
    const botonSorpresa = document.getElementById('btn-sorpresa');
    if (botonSorpresa) {
        botonSorpresa.addEventListener('click', window.iniciarSorpresa);
    }

    /* =========================================================
       7. BOTÓN MODO NOCHE / DÍA
       ========================================================= */
    const btnTema = document.getElementById('btn-tema');
    if (btnTema) {
        btnTema.addEventListener('click', () => {
            const esNoche = document.body.classList.toggle('modo-noche');
            btnTema.textContent = esNoche ? '☀️ Modo Día' : '🌙 Modo Noche';
        });
    }

});