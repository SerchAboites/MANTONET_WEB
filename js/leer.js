document.addEventListener('DOMContentLoaded', () => {
    let vozPreferida;

    function seleccionarVoz() {
        const voces = speechSynthesis.getVoices();
        const keywordsFemeninas = ['female', 'mujer', 'femenina', 'paulina', 'laura', 'isabella'];

        vozPreferida = voces.find(voz =>
            voz.lang === 'es-MX' && keywordsFemeninas.some(keyword => voz.name.toLowerCase().includes(keyword))
        ) || voces.find(voz =>
            voz.lang.startsWith('es-') && keywordsFemeninas.some(keyword => voz.name.toLowerCase().includes(keyword))
        ) || voces.find(voz => voz.lang === 'es-MX');
    }

    speechSynthesis.onvoiceschanged = seleccionarVoz;
    seleccionarVoz();

    const botonesVoz = document.querySelectorAll('.boton-voz');

    botonesVoz.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            // --- AJUSTE CLAVE AQUÍ ---
            // Buscamos el contenedor <section> o <details> más cercano
            const contenedor = boton.closest('section, details');

            if (!contenedor) return;

            // Buscamos el div con el contenido para leer dentro de ese contenedor
            const contenido = contenedor.querySelector('.contenido-para-leer, .contenido-desplegable');

            if (contenido && 'speechSynthesis' in window) {
                const texto = contenido.innerText;

                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                } else {
                    const utterance = new SpeechSynthesisUtterance(texto);
                    utterance.lang = 'es-MX';
                    if (vozPreferida) {
                        utterance.voice = vozPreferida;
                    }
                    speechSynthesis.speak(utterance);
                }
            } else {
                console.error("No se encontró el contenido para leer o el navegador no es compatible.");
            }
        });
    });

    // Esta parte sigue funcionando para los FAQs
    document.querySelectorAll('details.servicio-desplegable').forEach(details => {
        details.addEventListener('toggle', () => {
            if (!details.open && speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }
        });
    });

    window.addEventListener('beforeunload', () => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });
});