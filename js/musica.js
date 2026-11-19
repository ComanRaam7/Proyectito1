// musica.js
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.createElement("audio");
  audio.src = "assets/audio/Sunlight_On_The_Keys.mp3"; // Ajusta el nombre o usa "../assets/..." si el HTML está en una subcarpeta
  audio.loop = true;     // Se vuelve a reproducir automáticamente al terminar
  audio.autoplay = true; // Intenta iniciar al cargar la página
  audio.volume = 0.25;   // Volumen moderado (0.0 a 1.0)

  document.body.appendChild(audio);

  // Intento inmediato al entrar al HTML
  const intentarReproducir = () => {
    if (audio.paused) {
      audio.play().catch(() => {
        // Si el navegador bloquea el autoplay con sonido, esperará la primera interacción
      });
    }
  };

  intentarReproducir();

  // Respaldo: arranca en cuanto el usuario haga clic o presione una tecla en la página
  const activarEnInteraccion = () => {
    intentarReproducir();
    if (!audio.paused) {
      document.removeEventListener("click", activarEnInteraccion);
      document.removeEventListener("keydown", activarEnInteraccion);
    }
  };

  document.addEventListener("click", activarEnInteraccion);
  document.addEventListener("keydown", activarEnInteraccion);
});