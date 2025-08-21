import { leftNavFilterToggle } from './toggleNav.js';
import playerManager from './playerManager.js';
import {
  workWithListSelectors,
  transfereMinusPlus,
} from './playerListOperations.js';

function createPlayerInTheList(
  isNew = true,
  idElt = '',
  newPlayerObjInfo = {}
) {
  //isNew - означает что нужно создавать нового игрока и помещать в LocalStorage данные и новый id
  //Если false  то игрок введен вручную и нужно просто получить данные - idElt
  //index нужен для формирования id и правильной калибровки селектора
  //index используется только для isNew = true
  //newPlayerObjInfo {name: playerName, balance: playerIncome}; при создании нового игрока

  let playerObj = new playerManager();
  let newRow = playerManager.createPlayerTemplate();
  //count Players
  const playersQuantity = document.querySelectorAll(
    '.amnfr .players-container table.players-table tbody tr.player-item'
  );
  playerObj._playersQuantity = playersQuantity.length;

  if (isNew) {
    if (!newPlayerObjInfo) return;
    //рассчитать и задать начальные данные как this._playerName и тд
    newRow = playerObj.inputUniqID(newRow);
    playerObj.rowID = newRow.dataset.id;
    playerObj.newPlayerName = newPlayerObjInfo.name;
    playerObj.newIncome = newPlayerObjInfo.balance;
    playerObj.localStorageDataInput();
  } else {
    if (!idElt) return;
    playerObj.localStorageDataOutput(idElt);
    newRow.dataset.id = idElt;
  }

  newRow = playerObj.inputNameInTemplate(newRow);
  newRow = playerObj.inputIncomeInTemplate(newRow);
  //Составим селектор

  newRow = playerObj.inputHistoryInformation(newRow, isNew);
  return newRow;
}
function modifyHistoryTable(transfere, historyClass, thisPlayer, sender) {
  let thisNewHistoryRow = document.createElement('tr');
  for (let i = 0; i < 3; i++) {
    let thisNewTD = document.createElement('td');
    let thisNewDiv = document.createElement('div');
    thisNewDiv.className = 'move-pic';
    let thisNewSpan = document.createElement('span');
    switch (i) {
      case 0:
        thisNewTD.textContent = thisPlayer;
        break;
      case 1:
        thisNewDiv.classList.add(historyClass);
        thisNewSpan.textContent = transfere;
        thisNewDiv.appendChild(thisNewSpan);
        thisNewTD.appendChild(thisNewDiv);
        break;
      case 2:
        thisNewTD.textContent = sender;
        break;
    }
    thisNewHistoryRow.appendChild(thisNewTD);
  }
  return thisNewHistoryRow;
}
function insertTransfereData(trElt, infoObj, isThis) {
  let balanceElt = trElt.querySelector('td[name="player-balance"]');
  let historyTBody = trElt.querySelector(
    'td[name="player-history"] .transaction tbody'
  );
  let formattedPlayer = null;
  let sender = null;
  if (isThis) {
    formattedPlayer = infoObj.thisPlayer;
    sender = infoObj.thatPlayer.length ? infoObj.thatPlayer[3] : infoObj.sender;
  } else {
    formattedPlayer = infoObj.thatPlayer;
    sender = infoObj.thisPlayer[3];
  }
  balanceElt.textContent = formattedPlayer[1];

  let newHTr = modifyHistoryTable(
    infoObj.transfere,
    formattedPlayer[2],
    formattedPlayer[3],
    sender
  );
  if (!newHTr) return;
  historyTBody.appendChild(newHTr);
}

function addEventToInput(input) {
  input.addEventListener('blur', (e) => {
    formatToThousands(e.target);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      formatToThousands(e.target);
      //e.target.blur();
    }
  });
}
function formatToThousands(inputElt) {
  let inputVal = parseInt(inputElt.value.trim(), 10);
  inputVal = !isNaN(inputVal) ? Math.round(inputVal / 1000) * 1000 : 0;
  inputElt.value = inputVal;
}
function inputLocalStorageData(infoObj) {
  let senderName = infoObj.thatPlayer.length
    ? infoObj.thatPlayer[3]
    : infoObj.sender;
  //This Item
  let thisItem = JSON.parse(localStorage.getItem(infoObj.thisPlayer[0]));
  thisItem.balance = infoObj.thisPlayer[1];
  let historyThisLength = Object.keys(thisItem.history).length;
  let historyThisNewObj = {
    arrow: [infoObj.thisPlayer[2], infoObj.transfere],
    sender: senderName,
  };
  thisItem.history[historyThisLength] = historyThisNewObj;
  //localStorage Input
  localStorage.setItem(infoObj.thisPlayer[0], JSON.stringify(thisItem));

  //That Item
  if (!infoObj.thatPlayer.length) return;
  let thatItem = JSON.parse(localStorage.getItem(infoObj.thatPlayer[0]));
  thatItem.balance = infoObj.thatPlayer[1];
  let historyThatLength = Object.keys(thatItem.history).length;
  let historyThatNewObj = {
    arrow: [infoObj.thatPlayer[2], infoObj.transfere],
    sender: infoObj.thisPlayer[3],
  };
  thatItem.history[historyThatLength] = historyThatNewObj;
  //localStorage Input
  localStorage.setItem(infoObj.thatPlayer[0], JSON.stringify(thatItem));
}

function removePlayer(trID, playerName) {
  const trToRemove = document.querySelector(
    `.amnfr .players-container table.players-table tbody .player-item[data-id="${trID}"]`
  );
  if (!trToRemove) return;
  trToRemove.remove();
  //LocalStorageRemoveElement
  let allID = JSON.parse(localStorage.getItem('allIDArray'));
  if (allID.indexOf(trID) !== -1) {
    allID.splice(allID.indexOf(trID), 1);
    localStorage.setItem('allIDArray', JSON.stringify(allID));
  }
  // delete item
  localStorage.removeItem(trID);
  //delete from all selectors
  const allTRs = document.querySelectorAll(
    '.amnfr .players-container table.players-table tbody .player-item'
  );
  Array.from(allTRs).forEach((tr) => {
    const selector = tr.querySelector(
      'td[name=player-selector] .custom-select'
    );
    if (!selector) return;

    Array.from(selector.options).forEach((option, i) => {
      if (option.textContent.trim() === playerName) {
        selector.remove(i);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const playersContainer = document.querySelector('.amnfr .players-container');
  const playersContainerTBody = playersContainer.querySelector('tbody');

  //LOCAL STORAGE - create two players as template and check!
  const playerOneHistory = {
    0: {
      arrow: ['move-pic--left', 15000000],
      sender: 'Вход в игру',
    },
    1: {
      arrow: ['move-pic--right', 5000000],
      sender: 'Игрок 2',
    },
  };
  const playerOneObj = new playerManager();
  playerOneObj.newPlayerName = 'Игрок 1';
  playerOneObj.newIncome = 10000000;
  playerOneObj.rowID = '1275';
  playerOneObj.playerHistory = playerOneHistory;
  playerOneObj.localStorageDataInput();

  const playerTwoHistory = {
    0: {
      arrow: ['move-pic--left', 15000000],
      sender: 'Вход в игру',
    },
    1: {
      arrow: ['move-pic--left', 5000000],
      sender: 'Игрок 1',
    },
  };

  playerOneObj.newPlayerName = 'Игрок 2';
  playerOneObj.newIncome = 20000000;
  playerOneObj.rowID = '2321';
  playerOneObj.playerHistory = playerTwoHistory;
  playerOneObj.localStorageDataInput();
  // END of MANUAL LOCAL STORAGE INPUT

  // Попап Да/Нет
  const isContinue = confirm('Продолжить с существующими игроками?');

  if (!isContinue) {
    localStorage.clear();
  }

  //Retrieve DATA and CREATE ROW
  let IDArray = JSON.parse(localStorage.getItem('allIDArray')) || [];

  IDArray.forEach((idElt, i) => {
    let existRow = createPlayerInTheList(false, idElt, {});
    playersContainerTBody.appendChild(existRow);
    //ввод input transfere вручную
    const tdInput = existRow.querySelector('td[name="player-quantity"] input');
    addEventToInput(tdInput);
  });
  //заполняем везде опцию в селекторах
  workWithListSelectors();

  //Players List
  playersContainer.addEventListener('click', (event) => {
    event.preventDefault();
    const eventClicked = event.target;
    //scroll
    const scrollElt = eventClicked.closest('.scroll__item');
    if (scrollElt) {
      leftNavFilterToggle(scrollElt);
    }
    //PUSH TRANSFERE
    const playersList = document.querySelectorAll(
      '.amnfr .players-container tbody tr.player-item'
    );
    const pushButton = eventClicked.closest(
      `td.player-list-item[name="player-push"]`
    );
    if (pushButton) {
      if (playersList.length === 0) return;
      const thisTRElt = pushButton.closest('tr.player-item');
      let thatTR = null;
      if (thisTRElt) {
        let infoObj = transfereMinusPlus(thisTRElt.dataset.id.trim());
        if (!infoObj) return;
        //this Player Заменяем данные
        insertTransfereData(thisTRElt, infoObj, true);

        //That Player Заменяем данные
        if (infoObj.thatPlayer.length) {
          for (let tr of playersList) {
            if (tr.dataset.id === infoObj.thatPlayer[0]) thatTR = tr;
          }
          if (!thatTR) return;
          insertTransfereData(thatTR, infoObj, false);
        }
        inputLocalStorageData(infoObj);
        //check on MINUS BALANCE
        let thisPlayerBalance = parseInt(infoObj.thisPlayer[1], 10);
        let thatPlayerBalance = infoObj.thatPlayer.length
          ? parseInt(infoObj.thatPlayer[1], 10)
          : 0;
        const moneyLimit = -(5 * 10 ** 6);
        if (thisPlayerBalance <= moneyLimit) {
          removePlayer(infoObj.thisPlayer[0], infoObj.thisPlayer[3]);
        }
        if (infoObj.thatPlayer.length && thatPlayerBalance <= moneyLimit) {
          removePlayer(infoObj.thatPlayer[0], infoObj.thatPlayer[3]);
        }
      }
    }
    // DELETE BUTTON
    const deleteButton = eventClicked.closest(
      `td.player-list-item[name="player-delete"] button`
    );
    if (deleteButton) {
      const TRRow = deleteButton.closest('tr.player-item');
      const TRID = TRRow.dataset.id;
      const deletedPlayerElt = TRRow.querySelector('td[name="player-name"]');
      removePlayer(TRID, deletedPlayerElt.textContent.trim());
    }
  });

  //New Player create
  const newPlayerBlock = document.querySelector('.amnfr .newPlayer-container');
  const btnAdd = newPlayerBlock.querySelector('button.btn-add');
  btnAdd.addEventListener('click', (event) => {
    const playersList = document.querySelector('.amnfr .players-container');
    const playersTableBody = playersList.querySelector(
      'table.players-table tbody'
    );
    const tdRows = playersTableBody.querySelectorAll('.player-list-item');
    const newPlayerContainer = event.target.closest(
      '.amnfr .newPlayer-container'
    );

    //Validation
    const errMsg = newPlayerContainer.querySelector('.repeat-error');
    //player name
    let inputName = newPlayerContainer.querySelector('#player-name');
    let playerName = inputName.value.trim();

    if (!playerName) return false;
    //player name repeat
    const names = Array.from(tdRows).reduce((acc, elt) => {
      if (elt.getAttribute('name') === 'player-name') {
        acc.push(elt.textContent.trim());
      }
      return acc;
    }, []);
    errMsg.classList.remove('active-error');
    if (names.includes(playerName)) {
      errMsg.classList.add('active-error');
      return false;
    }
    //player income
    const inputIncome = newPlayerContainer.querySelector('#start-balance');
    let playerIncome = parseInt(inputIncome.value, 10);
    const newPlayerObjInfo = { name: playerName, balance: playerIncome };
    //create Row
    let newRow = createPlayerInTheList(true, '', newPlayerObjInfo);
    playersTableBody.appendChild(newRow);
    //ввод input transfere вручную
    const tdInput = newRow.querySelector('td[name="player-quantity"] input');
    addEventToInput(tdInput);
    //заполняем везде опцию в селекторах
    workWithListSelectors();
    //очистим инпут
    event.preventDefault();
    inputName.value = '';
  });
});
