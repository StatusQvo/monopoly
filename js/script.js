import { leftNavFilterToggle } from './toggleNav.js';
import playerManager from './playerManager.js';
import { workWithListSelectors } from './playerListOperations.js';

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
  const playersNames = [...playersQuantity].map((tr) =>
    tr.querySelector('td[name="player-name"]').textContent.trim()
  );

  newRow = playerObj.inputSelectorInformation(newRow, playersNames);
  newRow = playerObj.inputHistoryInformation(newRow, isNew);

  const tdRows =
    Array.from(playersQuantity).map[
      (tr) => tr.querySelector('.player-list-item')
    ];

  //заполняем везде опцию в селекторах
  //workWithListSelectors(newRow.newPlayerName, tdRows);
  return newRow;
}

document.addEventListener('DOMContentLoaded', () => {
  const playersContainer = document.querySelector('.amnfr .players-container');
  const playersContainerTBody = playersContainer.querySelector('tbody');

  localStorage.clear();
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

  //Retrieve DATA and CREATE ROW
  let IDArray = JSON.parse(localStorage.getItem('allIDArray')) || [];

  IDArray.forEach((idElt, i) => {
    let existRow = createPlayerInTheList(false, idElt, {});
    playersContainerTBody.appendChild(existRow);
  });

  //Players List
  playersContainer.addEventListener('click', (event) => {
    event.preventDefault();
    const eventClicked = event.target;
    //scroll
    const scrollElt = eventClicked.closest('.scroll__item');
    if (scrollElt) {
      leftNavFilterToggle(scrollElt);
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
    const trRows = playersList.querySelectorAll('.player-item');
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
  });
});
