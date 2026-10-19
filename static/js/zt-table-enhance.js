/* Wrap reading-room tables so they stay inside the content column and label
   stacked mobile cells with their original column headings. */
(function () {
  'use strict';

  var body = document.querySelector('.zt-reading-body');
  if (!body) return;

  body.querySelectorAll(':scope > table').forEach(function (table) {
    var wrapper = document.createElement('div');
    wrapper.className = 'zt-table-wrap';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);

    var headerCells = table.querySelectorAll('thead th');
    if (headerCells.length > 1) {
      var headerText = Array.prototype.map.call(headerCells, function (th) {
        return th.textContent.trim();
      });
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var cells = tr.children;
        for (var i = 1; i < cells.length && i < headerText.length; i++) {
          if (headerText[i]) cells[i].setAttribute('data-label', headerText[i]);
        }
      });
    }
  });
})();
