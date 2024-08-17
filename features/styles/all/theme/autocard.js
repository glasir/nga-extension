function createAutocards() {
  console.log("Generating autocard tooltips...");

  $(".autocard").tooltip({
    content:  function()  {
      return '<img src="' + this.getAttribute('img-url') + '" class="autocard-image" />';
    },
    items: '.autocard',
    track: true,
  })
}
