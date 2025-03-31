function generateNumbers() {
  let slots = document.querySelectorAll(".slot");
  slots.forEach((slot) => {
    let randomNumber = Math.random() < 0.5 ? 0 : 1; // Generates either 0 or 1
    slot.textContent = randomNumber;
  });
}
