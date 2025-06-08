document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const resultDiv = document.getElementById('result');

    const couponModal = document.getElementById('couponModal');
    const modalResult = document.getElementById('modalResult');
    const closeButton = document.querySelector('.close-button');
    const couponForm = document.getElementById('couponForm');

    // --> 1. OBTENER ELEMENTOS DE AUDIO
    const tickSound = document.getElementById('tickSound');
    const winSound = document.getElementById('winSound');

    const segments = [
        { text: '👍', color: '#8B0000', value: 'Seguir en nuestras redes' },
        { text: '⭐ 10', color: '#696969', value: 10 },
        { text: '👥', color: '#FF0000', value: 'Seguir en nuestras redes' },
        { text: '⭐ 20', color: '#696969', value: 20 },
        { text: '👍', color: '#8B0000', value: 'Seguir en nuestras redes' },
        { text: '🔄', color: '#FF0000', value: 'Segundo Intento' },
        { text: '💎 50', color: '#696969', value: 50 },
        { text: '🏆', color: '#FFD700', value: 'Servicio Completo' },
        { text: '👥', color: '#FF0000', value: 'Seguir en nuestras redes' },
        { text: '👍', color: '#8B0000', value: 'Seguir en nuestras redes' }
    ];
    const numSegments = segments.length;
    const arc = (2 * Math.PI) / numSegments;

    let isSpinning = false;
    let currentRotation = 0;
    let lastSegmentIndex = -1; // --> Para controlar el sonido de tick

    function drawWheel() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < numSegments; i++) {
            const angle = i * arc;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arc);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);

            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 2
            );

            let baseColor = segments[i].color;
            let darkerColor;

            if (baseColor === '#8B0000') darkerColor = '#500000';
            else if (baseColor === '#FF0000') darkerColor = '#B00000';
            else if (baseColor === '#696969') darkerColor = '#303030';
            else if (baseColor === '#FFD700') darkerColor = '#C0A000'; // Sombra para el dorado
            else darkerColor = baseColor;

            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, darkerColor);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = '#4B0000'; // Borde oscuro
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle + arc / 2 + Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            // --> 2. EMOJI MÁS GRANDE (puedes ajustar el valor '30px')
            ctx.font = 'bold 30px Arial';
            ctx.fillText(segments[i].text, 0, -canvas.width / 2 + 50); // Ajusta la posición si es necesario
            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI);
        ctx.fillStyle = '#363636';
        ctx.fill();
        ctx.strokeStyle = '#4B0000';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    function drawPointer() {
        ctx.save();
        ctx.translate(canvas.width / 2, 0);
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 30);
        ctx.closePath();
        ctx.fillStyle = '#202020';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;
        resultDiv.textContent = '¡Girando...!';
        spinButton.disabled = true;
        lastSegmentIndex = -1; // Reinicia el tracker del sonido

        const spinDuration = 5000;
        const totalFullSpins = 5;
        const targetSegmentIndex = Math.floor(Math.random() * numSegments);
        let targetStopAngle = (-Math.PI / 2) - (targetSegmentIndex * arc + arc / 2);
        targetStopAngle = (targetStopAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        let angleToSpinFromCurrent = targetStopAngle - (currentRotation % (2 * Math.PI));
        if (angleToSpinFromCurrent < 0) {
            angleToSpinFromCurrent += (2 * Math.PI);
        }
        const totalSpinAmount = angleToSpinFromCurrent + (totalFullSpins * 2 * Math.PI);
        let startTime;

        function animateSpin(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / spinDuration, 1);
            const easing = 1 - Math.pow(1 - progress, 3);
            const currentAnimatedAngle = currentRotation + (totalSpinAmount * easing);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(currentAnimatedAngle);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();
            drawPointer();

            // --> 3. LÓGICA PARA SONIDO DE "TICK"
            const currentSegment = Math.floor((numSegments - (currentAnimatedAngle / arc) % numSegments) % numSegments);
            if (currentSegment !== lastSegmentIndex) {
                tickSound.currentTime = 0; // Reinicia el sonido para reproducirlo rápido
                tickSound.play();
                lastSegmentIndex = currentSegment;
            }

            if (progress < 1) {
                requestAnimationFrame(animateSpin);
            } else {
                isSpinning = false;
                spinButton.disabled = false;
                currentRotation = currentAnimatedAngle % (2 * Math.PI);
                const winner = segments[targetSegmentIndex];

                // --> 4. REPRODUCIR SONIDO DE PREMIO
                winSound.currentTime = 0;
                winSound.play();

                let prizeDisplayText;
                if (typeof winner.value === 'number') {
                    prizeDisplayText = `${winner.value} Puntos`;
                } else {
                    prizeDisplayText = winner.value;
                }
                resultDiv.textContent = `Resultado: ${prizeDisplayText}`;
                modalResult.textContent = `¡Has ganado: ${prizeDisplayText}!`;
                couponModal.style.display = 'flex';
                couponForm.reset();
                couponForm.dataset.prizeText = prizeDisplayText;
                couponForm.dataset.prizeValue = winner.value;
                console.log(`El usuario obtuvo: ${winner.text} (Valor: ${winner.value})`);
            }
        }
        requestAnimationFrame(animateSpin);
    }

    closeButton.addEventListener('click', () => {
        couponModal.style.display = 'none';
        couponForm.reset();
        resultDiv.textContent = '¡Gira de nuevo para probar suerte!';
    });

    window.addEventListener('click', (event) => {
        if (event.target === couponModal) {
            couponModal.style.display = 'none';
            couponForm.reset();
            resultDiv.textContent = '¡Gira de nuevo para probar suerte!';
        }
    });

    couponForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const prizeText = couponForm.dataset.prizeText;
        const prizeValue = couponForm.dataset.prizeValue;
        console.log('--- Formulario de Cupón Enviado ---');
        console.log('Premio Ganado (Texto):', prizeText);
        console.log('Premio Ganado (Valor):', prizeValue);
        console.log('Email:', email);
        console.log('Nombre:', name);
        console.log('Celular:', phone);
        console.log('-----------------------------------');
        couponModal.style.display = 'none';
        couponForm.reset();
        resultDiv.textContent = '¡Gracias por participar! Revisa tu correo o celular para tu cupón.';
    });

    spinButton.addEventListener('click', spinWheel);
    drawWheel();
    drawPointer();
});