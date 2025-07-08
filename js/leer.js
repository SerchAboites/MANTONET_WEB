document.addEventListener('DOMContentLoaded', () => {
    let vozPreferida; // Variable para guardar la voz que encontremos

    // --- MEJORA: FUNCIÓN PARA BUSCAR Y ASIGNAR LA VOZ PREFERIDA ---
    function seleccionarVoz() {
        // Obtenemos la lista de voces disponibles en el navegador
        const voces = speechSynthesis.getVoices();
        
        // Palabras clave para identificar una voz femenina en español
        const keywordsFemeninas = ['female', 'mujer', 'femenina', 'paulina', 'laura', 'isabella'];

        // 1. Buscamos la voz ideal: Español de México y Femenina.
        vozPreferida = voces.find(voz =>
            voz.lang === 'es-MX' && keywordsFemeninas.some(keyword => voz.name.toLowerCase().includes(keyword))
        );

        // 2. Si no la encontramos, buscamos cualquier voz en español que sea femenina.
        if (!vozPreferida) {
            vozPreferida = voces.find(voz =>
                voz.lang.startsWith('es-') && keywordsFemeninas.some(keyword => voz.name.toLowerCase().includes(keyword))
            );
        }
        
        // 3. Como última opción, si no hay femenina, tomamos la primera de México que encontremos.
        if (!vozPreferida) {
             vozPreferida = voces.find(voz => voz.lang === 'es-MX');
        }
    }

    // El navegador tarda un momento en cargar las voces.
    // Este evento se dispara cuando las voces ya están listas.
    speechSynthesis.onvoiceschanged = seleccionarVoz;
    // También llamamos a la función una vez por si las voces ya estaban cargadas.
    seleccionarVoz();


    // El resto de tu código permanece casi igual
    const botonesVoz = document.querySelectorAll('.boton-voz');

    botonesVoz.forEach(boton => {
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const detailsElement = boton.closest('details');
            const contenido = detailsElement.querySelector('.contenido-desplegable, .contenido-para-leer');

            if (contenido && 'speechSynthesis' in window) {
                const texto = contenido.innerText;

                if (speechSynthesis.speaking) {
                    speechSynthesis.cancel();
                } else {
                    const utterance = new SpeechSynthesisUtterance(texto);
                    utterance.lang = 'es-MX'; // Mantenemos el idioma deseado

                    // --- MEJORA: ASIGNAMOS LA VOZ PREFERIDA SI LA ENCONTRAMOS ---
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