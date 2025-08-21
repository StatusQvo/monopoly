export function workWithListSelectors() {
  let trRows = document.querySelectorAll(
    '.amnfr .players-container table.players-table tbody .player-item'
  );
  let trRowsArr = Array.from(trRows);
  let namesList = trRowsArr.reduce((acc, tr) => {
    let tdName = tr.querySelector('td[name="player-name"]');
    let id = tr.dataset.id;
    if (tdName) {
      acc.push([id, tdName.textContent.trim()]);
    }
    return acc;
  }, []);
  if (!namesList) return;
  trRows.forEach((tr) => {
    let selector = tr.querySelector(
      'td[name="player-selector"] select.custom-select'
    );
    let onlyOptions = Array.from(selector.options).map(
      (elt) => elt.textContent
    );
    namesList.forEach((idname, i) => {
      //чтобы не записать самого игрока в селектор опцию и чтобы повторно не записывать других
      if (tr.dataset.id !== idname[0] && !onlyOptions.includes(idname[1])) {
        let newOption = document.createElement('option');
        newOption.value = onlyOptions.length + i;
        newOption.textContent = idname[1];
        selector.appendChild(newOption);
      }
    });
  });
}

export function transfereMinusPlus(rowID) {
  let trRows = document.querySelectorAll(
    '.amnfr .players-container table.players-table tbody .player-item'
  );
  let trRow = document.querySelector(
    `.amnfr .players-container table.players-table tbody .player-item[data-id="${rowID}"]`
  );
  if (!trRow) return;
  //все данные со взаимодействием
  let currentBalanceElt = trRow.querySelector('td[name="player-balance"]');
  let currentPlayerElt = trRow.querySelector('td[name="player-name"]');
  let currentPlayerName = currentPlayerElt.textContent.trim();
  let isPlusElt = trRow.querySelector('td[name="player-operation"] .scroll');
  let transfereElt = trRow.querySelector(
    'td[name="player-quantity"] input.form-control'
  );
  let selectorElt = trRow.querySelector(
    'td[name="player-selector"] select.custom-select'
  );
  if (!isPlusElt || !transfereElt || !currentBalanceElt || !selectorElt) return;
  let isPlus = isPlusElt.classList.contains('scroll--active');

  let transfere =
    transfereElt.value === '' ? 0 : parseInt(transfereElt.value, 10);
  let senderTransfer = parseInt(selectorElt.value, 10);
  let currentBalance = parseInt(currentBalanceElt.textContent, 10);
  transfereElt.value = 0; //обнуляем
  if (
    transfere === 0 ||
    isNaN(transfere) ||
    isNaN(currentBalance) ||
    senderTransfer === 0
  )
    return;
  //Если игровое поле
  let existOtherplayer = senderTransfer !== 1 ? true : false;
  //Find sender Name
  let senderNameElt = selectorElt.querySelector(
    `option[value="${senderTransfer}"]`
  );

  let thatPlayer = [];
  let otherCurrentBalance = 0;
  let senderName = senderNameElt.textContent.trim();
  let senderRow = '';

  if (existOtherplayer) {
    trRows.forEach((tr) => {
      let playerNameElt = tr.querySelector('td[name="player-name"]');
      let playerName = playerNameElt.textContent.trim();
      if (playerName === senderName) {
        senderRow = tr.dataset.id;
        let otherCurrentNote = tr.querySelector('td[name="player-balance"]');
        otherCurrentBalance = parseInt(otherCurrentNote.textContent.trim(), 10);
      }
    });
  } //exist Player

  //result operation
  let newBalance = 0;
  let otherNewBalace = '';
  let newHistoryClass = '';
  let oherNewHistoryClass = 'move-pic--right';
  if (isPlus) {
    newBalance = currentBalance + transfere;
    otherNewBalace = otherCurrentBalance - transfere;
    newHistoryClass = 'move-pic--left';
    oherNewHistoryClass = 'move-pic--right';
  } else {
    newBalance = currentBalance - transfere;
    otherNewBalace = otherCurrentBalance + transfere;
    newHistoryClass = 'move-pic--right';
    oherNewHistoryClass = 'move-pic--left';
  }
  if (existOtherplayer) {
    thatPlayer = [senderRow, otherNewBalace, oherNewHistoryClass, senderName];
  }
  let infoObj = {
    thisPlayer: [rowID, newBalance, newHistoryClass, currentPlayerName],
    thatPlayer: thatPlayer,
    transfere: transfere,
    sender: senderName,
  };

  return infoObj;
}
