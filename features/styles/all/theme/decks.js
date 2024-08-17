
function makeDecklists() {
  $('div.decklist').html(function () {
    console.log("Initializing decks...");
    var lines = this.innerHTML.split('<br>'),
      newHtml = '',
      thisLine,
      matchResult,
      count,
      cardName,
      i;

    for (i = 0; i < lines.length; ++i) {
      thisLine = lines[i];
      if (thisLine.trim) { thisLine = thisLine.trim(); }

      matchResult = thisLine.match(/^\s*(\d+)\s*x?\s*([^\n]+)$/);
      if (matchResult) {
        count = parseInt(matchResult[1], 10);
        cardName = matchResult[2];
        if (cardName.trim) { cardName = cardName.trim(); }

        newHtml += count + ' x <span class="autocard">' + cardName + '@@' + cardName + '</span><br>';
      } else {
        newHtml += thisLine + '<br>';
      }
    }

    return newHtml;
  });
}
