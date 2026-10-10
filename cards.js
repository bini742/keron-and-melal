(() => {
  const name = new URLSearchParams(location.search).get("name")?.trim().slice(0, 24) || "you";
  const card = document.getElementById("story-card");
  const media = document.getElementById("card-media");
  const copy = document.getElementById("card-copy");
  const count = document.getElementById("card-count");
  
  const slides = [
    { photo: "photo-one.png", title: "happy birthday melal" },
    { photo: "photo-two.png", title: "happy birthday keron" },
    { 
      letter: true, 
      title: `Dear ${name},`, 
      message: "Happy birthday 🎂too the most amazing twins I've ever 💗 we I've u guys so much like alot we've been friends for 4 years things aren't the same rn but we had the most amazing friendship we miss u guys a lot 💖 this year u guy's turned 15 u guys i have grown soo much we watched u grow we miss u keron u used to treat us as ur kids acting like our mom even tho ur soooo annoying we miss melal tooo ur unfunny jokes ur weird embarrassing asss we js misss u guys soo much u don't know how life is boring this year hope u guys have the best year and hope u guys come back we LOVE YOU SOOOOOOO SOOOOO MUCHH .", 
      signature: "Hope u guy's like it<br>Fenet, Eldana, Liya 💗🤗💖" 
    }
  ];

  // Preload images into memory immediately in the background for fast performance
  slides.forEach(slide => {
    if (slide.photo) {
      const img = new Image();
      img.src = slide.photo;
    }
  });

  let index = 0;
  function render() {
    const slide = slides[index];
    card.classList.add("is-changing");
    setTimeout(() => {
      if (slide.letter) {
        card.classList.add("is-letter");
        media.hidden = true;
        media.innerHTML = "";
        copy.className = "card-copy letter-copy";
        copy.innerHTML = `<h2>${slide.title}</h2><p>${slide.message}</p><p class="signature">${slide.signature}</p>`;
      } else {
        card.classList.remove("is-letter");
        media.hidden = false;
        media.innerHTML = `<img class="memory-photo" src="${slide.photo}" alt="Birthday memory">`;
        copy.className = "card-copy";
        copy.innerHTML = `<h2>${slide.title}</h2>`;
      }
      count.textContent = `Card ${index + 1} of ${slides.length}`;
      card.classList.remove("is-changing");
    }, 160);
  }

  document.getElementById("previous-card").addEventListener("click", () => { index = (index - 1 + slides.length) % slides.length; render(); });
  document.getElementById("next-card").addEventListener("click", () => { index = (index + 1) % slides.length; render(); });
  render();
})();