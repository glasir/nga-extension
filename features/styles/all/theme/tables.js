
function makeTables() {
  console.log("Initializing tables...");
  function getCellOptions(contents) {
    var options = {},
      parts,
      optionParts,
      endBraceIdx,
      i;
    
    // Bail out if the first character isn't '{'
    if (contents[0] !== '{' || contents.indexOf('}') < 0) {
      options['rest'] = contents;
      return options;
    }

    endBraceIdx = contents.indexOf('}');
    parts = contents.substring(1, endBraceIdx).split(',');

    for (i = 0; i < parts.length; ++i) {
      optionParts = parts[i].split('=');
      options[ optionParts[0] ] = optionParts[1];
    }

    options['rest'] = contents.substring(endBraceIdx + 1);
    return options;
  }

  function parseRow(line, numCols, isHeader, isSortable) {
    var parts = line.split('|'),
      html = '',
      tag = (isHeader ? 'th' : 'td'),
      attribs = '',
      style = '',
      colsMade = 0,
      options,
      span,
      text,
      i;

    for (i = 0; i < parts.length; ++i) {
      style = attribs = '';
      options = getCellOptions(parts[i]);
      text = options['rest']

      if (options['colsp'] !== undefined) {
        span = parseInt(options['colsp']);
        attribs = 'colspan="' + span + '" ';
        colsMade += span;
      } else {
        colsMade++;
      }

      if (options['color'] !== undefined) {
        style += 'background-color:' + options['color'] + ';';
      }


      if (style.length > 0) {
        style = 'style="' + style + '"';
      }

      if (isSortable) {
        text = '<span class="sort_header" onclick="nga_sortTable(this, ' + i + ')">' + text + '</span>';
      }

      html += '<' + tag + ' ' + attribs + ' ' + style + '>' + text + '</' + tag + '>';
    }

    // fill out empty columns
    for (colsMade; colsMade < numCols; ++colsMade) {
      html += '<' + tag + '></' + tag + '>';
    }

    return html;
  }

  function getNumCols(line) {
    var cols =  line.split('|'),
      numCols = 0,
      i;

    for (i = 0; i < cols.length; ++i) {
      if (cols[i].substring(0, 7) === '{colsp=') {
        numCols += parseInt(cols[i].substring(7), 10);
      } else {
        numCols++;
      }
    }

    return numCols;
  }

  $('span.table').replaceWith(function () {
    var el = $(this),
      text = $(el).html(),
      lines = text.split(/\s*<br>\s*/),
      options = el.attr('options'),
      html = '',
      curLine = 0,
      numCols = Math.max.apply(null, lines.map(getNumCols)),
      oldRowColor = 1,
      rowColor = 1,
      hasHeader = false,
      isSortable = false,
      isPlain = false;

    // set up table options
    html = '<table';

    if (options) {
      // center the table?
      if (options.indexOf('center') >= 0) {
        html += ' style="margin-left:auto;margin-right:auto;"';
      }

      // have a header
      if (options.indexOf('header') >= 0) {
        hasHeader = true;
        if (options.indexOf('sortable') >= 0) {
          isSortable = true;
        }
      }

      // be incredibly boring
      if (options.indexOf('plain') >= 0) {
        isPlain = true;
      }
    }

    if (!isPlain) {
      html += ' class="goblintable" border="1"';
    } else {
      html += ' class="goblintable plain"';
    }

    html += '>';

    if (hasHeader) {
      html += '<thead class="thead"><tr>';
      html += parseRow(lines[0], numCols, true, isSortable);
      html += '</tr></thead>';

      curLine = 1;
    }

    html += '<tbody>';

    for (curLine; curLine < lines.length; ++curLine) {
      if (lines[curLine] === "") {
        continue;
      }
      html += '<tr class="row' + oldRowColor + ' table-row' + rowColor + '">';
      html += parseRow(lines[curLine], numCols, false);
      html += '</tr>';

      oldRowColor = 4 - oldRowColor; // alternate between row1 and row3
      rowColor = 3 - rowColor;  // alternate between table-row1 and table-row2
    }

    html += '</tbody></table>';

    return html;
  });
}


function nga_sortTable(link, column) {
  // first, get the table to sort from the <a> passed in the `link` parameter
  var table = link;
  while (table.tagName !== 'TABLE' && table.parentNode) {
    table = table.parentNode;
  }

  // update the little arrow saying "Sorted (ASC/DESC) by column X"

  var sortDir = 1, sortClass = 'sort_desc';  // assume sort in descending order
  if ($(table.rows[0].cells[column]).find('span').hasClass('sort_desc')) {
    sortDir = -1, sortClass = 'sort_asc';    // unless it's already sorted
  }

  // remove all old arrows
  for (var i = 0; i < table.rows[0].cells.length; ++i) {
    $(table.rows[0].cells[i]).find('span').removeClass('sort_asc').removeClass('sort_desc');
  }

  $(table.rows[0].cells[column]).find('span').addClass(sortClass);

  // figure out what column to actually sort by. this can differ because cells
  // can span multiple columns
  var sortCol = 0;
  for (var i = 0; i < column; ++i) {
    sortCol += table.rows[0].cells[i].colSpan;
  }

  // detach all rows except the first
  var rows = $(table).find("tr:gt(0)").detach()

  // get the first text to appear in the sort-column of each (non-header) row
  var keyedRows = [];
  var allKeysAreNumbers = true;
  for (var i = 0; i < rows.length; ++i) {
    var thisRow = rows[i];

    // count columns out to the column we're sorting by
    var thisSortCol = 0;
    for (var colCount = 0; colCount < sortCol; colCount += thisRow.cells[thisSortCol].colSpan) {
      thisSortCol++;
    }

    var cellText = $(thisRow.cells[thisSortCol]).text();

    if (allKeysAreNumbers) {
      if (isNaN(parseFloat(cellText)) || !isFinite(cellText)) {
        allKeysAreNumbers = false;
      }
    }

    keyedRows.push( [ cellText, thisRow ] );
  }

  // If all keys are numbers, sort numerically instead of alphabetically
  if (allKeysAreNumbers) {
    for (var i = 0; i < keyedRows.length; ++i) {
      keyedRows[i][0] = parseFloat( keyedRows[i][0] );
    }
  }

  // sort by that that text
  keyedRows.sort(function(a, b) {
    var aLessB = (a[0] < b[0] ? -1 : a[0] > b[0]);    // returns -1 if a < b, True if a > b, False if a == b.
    return sortDir * aLessB;
  });

  // add rows in the right order
  var oldRowColor = 1, rowColor = 1;
  for (var i = 0; i < keyedRows.length; ++i) {
    var rowToAdd = keyedRows[i][1];
    $(rowToAdd).removeClass('row1').removeClass('row3').removeClass('table-row1').removeClass('table-row2');
    $(rowToAdd).addClass('row' + oldRowColor).addClass('table-row' + rowColor);
    oldRowColor = 4 - oldRowColor;
    rowColor = 3 - rowColor;

    $(table).append(keyedRows[i][1]);
  }

  // fix up the "rowX" class, which provides background color.

}
