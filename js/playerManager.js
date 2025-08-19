export default class playerManager {
  constructor(playerName = '') {
    this._newPlayerName = playerName;
    this._playersQuantity = 0;
    this._newIncome = 0;
    this._rowID = '';
    this._history = {};
  }

  set newPlayerName(playerName) {
    this._newPlayerName = playerName;
  }
  get newPlayerName() {
    return this._newPlayerName;
  }
  set playersQuantity(quantity) {
    this._playersQuantity = quantity;
  }
  set newIncome(newIncome) {
    this._newIncome = newIncome;
  }
  set rowID(ID) {
    this._rowID = ID;
  }
  get rowID() {
    return this._rowID;
  }
  set playerHistory(playerHistory) {
    this._history = playerHistory;
  }

  inputNameInTemplate(newRow) {
    const nameColumn = newRow.querySelector('td[name="player-name"]');
    nameColumn.textContent = this._newPlayerName;
    return newRow;
  }
  inputUniqID(newRow) {
    let randomNum = this.randomizerFunction();
    while (this.localStorageIDCheck(randomNum)) {
      randomNum = this.randomizerFunction();
    }
    newRow.dataset.id = randomNum;
    return newRow;
  }
  randomizerFunction() {
    let randDigit = Math.floor(Math.random() * 1000);
    let randThreeDigit =
      '' + (this._playersQuantity + 1) + randDigit.toString().padStart(2, 0);
    return randThreeDigit;
  }
  localStorageIDCheck(ID) {
    const IDArrays = JSON.parse(localStorage.getItem('allIDArray')) || [];
    return IDArrays.includes(ID);
  }
  inputIncomeInTemplate(newRow) {
    const incomeColumn = newRow.querySelector('td[name="player-balance"]');
    incomeColumn.textContent = this._newIncome;
    return newRow;
  }
  inputSelectorInformation(newRow, names) {
    const newSelection = newRow.querySelector(
      'td[name="player-selector"] select.custom-select'
    );
    names.forEach((name, i) => {
      let newOption = document.createElement('option');
      newOption.id = i + 2;
      newOption.textContent = name;
      newSelection.appendChild(newOption);
    });
    return newRow;
  }
  inputHistoryInformation(newRow, isNew = true) {
    //Разные IDшки в аккордионе
    const accordionContainer = newRow.querySelector(
      'td[name="player-history"] .accordion'
    );
    accordionContainer.id = accordionContainer.id + this._rowID;
    const accordionHeader = accordionContainer.querySelector(
      'h2.accordion-header'
    );
    accordionHeader.id = accordionHeader.id + this._rowID;
    const accordionButton = accordionHeader.querySelector(
      'button.accordion-button'
    );
    // Заполнение всех ID в аккордион
    accordionButton.dataset.bsTarget =
      accordionButton.dataset.bsTarget + this._rowID;
    let accordionButtonAttr =
      accordionButton.getAttribute('aria - controls') + this._rowID;
    accordionButton.setAttribute('aria-controls', accordionButtonAttr);
    let accordionDiv = accordionContainer.querySelector('div#collapseTwo');
    accordionDiv.id = accordionDiv.id + this._rowID;
    let accordionDivAttr =
      accordionDiv.getAttribute('aria-labelledby') + this._rowID;
    accordionDiv.setAttribute('aria-labelledby', accordionDivAttr);
    accordionDiv.dataset.bsParent = accordionDiv.dataset.bsParent + this._rowID;

    if (isNew) {
      const objHistory = {
        0: {
          arrow: ['move-pic--left', 15000000],
          sender: 'Вход в игру',
        },
      };
      this._history = objHistory;
    }

    let tBodyEmpty = newRow.querySelector(
      'td[name="player-history"] .accordion-body table tbody'
    );

    this._reshapeHistoryTable(tBodyEmpty);
    return newRow;
  }
  //inner function for History
  _reshapeHistoryTable(tBodyEmpty) {
    //НОВАЯ СТРОКА в Таблице Истории
    //{0: {arrow: ['move-pic--left', 15000000], sender: 'Вход в игру'} - пример записи истории
    //tr/td/PlayerName//td/td/div move-pic move-pic--left/span/15000000//span//div//td/td/Вход в игру//td//tr

    tBodyEmpty.innerHTML = '';

    const dataArray = Object.values(this._history);
    dataArray.forEach((historyRow) => {
      let arrowInfoArr = historyRow.arrow ? historyRow.arrow : ['', ''];
      let senderInfo = historyRow.sender ? historyRow.sender : '';
      let newTr = document.createElement('tr');
      //2nd column children elements
      let divPic = document.createElement('div');
      divPic.className = 'move-pic';
      divPic.classList.add(arrowInfoArr[0]);
      let spanPic = document.createElement('span');
      spanPic.textContent = arrowInfoArr[1];
      divPic.appendChild(spanPic);
      for (let i = 0; i < 3; i++) {
        let newTD = document.createElement('td');
        //В зависимости от номера колонки заполняем данные из dataArray
        switch (i) {
          case 0:
            newTD.textContent = this._newPlayerName;
            break;
          case 1:
            newTD.appendChild(divPic);
            break;
          case 2:
            newTD.textContent = senderInfo;
            break;
        }
        newTr.appendChild(newTD);
      }
      tBodyEmpty.appendChild(newTr);
    });
  }

  //ДАННЫЕ в LOCAL STORAGE;
  localStorageDataInput() {
    if (this.localStorageIDCheck(this._rowID)) return;

    let IDArray = JSON.parse(localStorage.getItem('allIDArray')) || [];
    IDArray.push(this._rowID);
    localStorage.setItem('allIDArray', JSON.stringify(IDArray));
    //Main IDs
    const rowID = this._rowID;
    const commonObject = {
      name: this._newPlayerName,
      balance: this._newIncome,
      history: this._history,
    };
    localStorage.setItem(rowID, JSON.stringify(commonObject));
  }
  localStorageDataOutput(rowID) {
    const playerData = localStorage.getItem(rowID);
    if (!playerData) return;
    const playerDataObject = JSON.parse(playerData);
    if (!playerDataObject) return;

    this._rowID = rowID;
    this._newPlayerName = playerDataObject['name'];
    this._newIncome = playerDataObject['balance'];
    this._history = playerDataObject['history'];
  }

  static createPlayerTemplate() {
    const newRow = document.createElement('tr');
    newRow.className = 'player-item';

    const arrayColumnNames = [
      'player-name',
      'player-balance',
      'player-quantity',
      'player-operation',
      'player-selector',
      'player-push',
      'player-history',
      'player-delete',
    ];

    arrayColumnNames.forEach((name) => {
      const newTD = document.createElement('td');
      newTD.setAttribute('name', name);
      newTD.classList.add('player-list-item');
      //input
      const inputNewZero = document.createElement('input');
      Object.assign(inputNewZero, {
        type: 'number',
        name: 'operation',
        className: 'form-control',
        step: '1000',
        min: '0',
        max: '999000000',
        placeholder: '0',
      });
      //scroll
      const divScroll = document.createElement('div');
      divScroll.classList.add('scroll');
      divScroll.innerHTML =
        "<div class='scroll__item'></div><div class='scroll__description d-flex justify-content-between col-3'><span>-</span><span>+</span></div>";
      //selector
      const divSelect = document.createElement('div');
      divSelect.classList.add('custom-select-wrapper');
      divSelect.innerHTML =
        "<select class='custom-select'><option value='0'>$ перевод</option><option value='1'>Игровое поле</option></select>";
      //push
      const imgPush = document.createElement('img');
      imgPush.setAttribute('src', 'media/mark.svg');
      imgPush.setAttribute('alt', 'button pic');
      const btnPush = document.createElement('button');
      btnPush.appendChild(imgPush);
      //history
      const divHistory = document.createElement('div');
      divHistory.classList.add('accordion', 'mt-2', 'mb-2');
      divHistory.id = 'accordionSelector';
      divHistory.innerHTML =
        "<div class='accordion-item player-history-container ms-2 me-2'><h2 class='accordion-header' id='headingTwo'><button class='accordion-button collapsed' type='button' data-bs-toggle='collapse' data-bs-target='#collapseTwo' aria-expanded='true' aria-controls='collapseTwo'>История средств</button></h2><div id='collapseTwo' class='accordion-collapse collapse' aria-labelledby='headingTwo' data-bs-parent='#accordionSelector'><div class='accordion-body'><div class='transaction'><table><thead><tr><th>От кого</th><th>Движение $</th><th>Куда</th></tr></thead><tbody></tbody></table></div></div></div>";
      //delete
      const imgDelete = document.createElement('img');
      imgDelete.setAttribute('src', 'media/delete.svg');
      imgDelete.setAttribute('alt', 'button pic');
      const btnDelete = document.createElement('button');
      btnDelete.appendChild(imgDelete);

      switch (name) {
        case 'player-name':
          newTD.classList.add('col-4');
          break;
        case 'player-balance':
          newTD.classList.add('col-2');
          newTD.textContent = '15000000';
          break;
        case 'player-quantity':
          newTD.classList.add('col-2');
          newTD.appendChild(inputNewZero);
          break;
        case 'player-operation':
          newTD.appendChild(divScroll);
          break;
        case 'player-selector':
          newTD.appendChild(divSelect);
          break;
        case 'player-push':
          newTD.appendChild(btnPush);
          break;
        case 'player-history':
          newTD.classList.add('col-6', 'col-md-4', 'col-lg-2', 'p-1');
          newTD.appendChild(divHistory);
          break;
        case 'player-delete':
          newTD.appendChild(btnDelete);
          break;

        default:
          break;
      }
      newRow.appendChild(newTD);
    });
    return newRow;
  }
}
