// your code goes here ...
let household = [];

class Event {
  constructor(name) {
    this.name = name;
    this.handlers = [];
  }

  addHandler(handler) {
    this.handlers.push(handler);
  }

  removeHandler(handler) {
    for(let i=0; i < this.handlers.length; i++) {
      if (this.handlers[i] == handler) {
        this.handlers.splice(i, 1);
        break;
      }
    }
  }

  fire(eventArgs) {
    this.handlers.forEach((handler) => {
      handler(eventArgs);
    });
  }
}

const eventAggregator = (() => {
  let events = [];

  const getEvent = (eventName) => {
    let event = events.filter((event) => {
      return event.name == eventName;
    })[0];
    
    if (!event) {
      event = new Event(eventName);
      events.push(event);
    }

    return event;
  }

  const publish = (eventName, eventArgs) => {
    let event = getEvent(eventName);

    event.fire(eventArgs);
  }

  const subscribe = (eventName, handler) => {
    let event = getEvent(eventName);
    event.addHandler(handler);
  }

  return {
    publish,
    subscribe
  };
})();


class HouseholdItem {
  constructor(age, relationship, smoker) {
    this.age = age;
    this.relationship = relationship;
    this.smoker = smoker;
  }
}

const listHousehold = (() => {

  const household = [];
  const ol = document.querySelector('ol.household');

  const createSpan = (text) => {
    const span = document.createElement('span');
    span.textContent = `${text} `;
    return span;
  }

  const removeItem = (id) => {
    household.splice(id, 1);
    displayAllItems();
  }

  const editItem = (id) => {
    console.log('editItem ', id);
    eventAggregator.publish('household.item.edit', id, household[id]);
  }

  const createRemoveButton = (i) => {
    const removeButton = document.createElement('button');
    removeButton.id = `household-${i}`;
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', e => removeItem(i));

    return removeButton;
  }

  const createEditButton = (i) => {
    const editButton = document.createElement('button');
    editButton.id = `household-${i}`;
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', e => editItem(i));

    return editButton;
  }

  const displayAllItems = () => {
    while (ol.hasChildNodes()) {
      ol.removeChild(ol.lastChild);
    }

    for (let i=0; i < household.length; i++) {
      displayItem(i);
    }
  }

  const displayItem = (i) => {
    const item = household[i];

    const li = document.createElement('li');
    const div = document.createElement('div');
    const divInfo = document.createElement('div');
    divInfo.appendChild(createSpan(item.age));
    divInfo.appendChild(createSpan(item.relationship))
    divInfo.appendChild(createSpan(item.smoker ? 'Smoker' : 'Not smoker'));

    const divActions = document.createElement('div');
    const removeButton = createRemoveButton(i);
    const editButton = createEditButton(i);    

    divActions.appendChild(removeButton);
    divActions.appendChild(editButton);

    div.appendChild(divInfo);
    div.appendChild(divActions);
    
    li.appendChild(div);
    ol.appendChild(li);
  }

  const addedHouseholdItem = (item) => {
    console.log('addedHouseholdItem ', item);
    household.push(item);

    displayAllItems();
  }

  const init = () => {
    eventAggregator.subscribe('household.item.added', addedHouseholdItem);
  }

  return {
    init
  }

})();

const addHouseholdItemForm = (() => {

  const householdForm = document.querySelector('form');

  const cleanError = () => {
    console.log('cleanError');
    document.querySelector('div#error')?.remove();
  }

  const displayError = (err) => {
    cleanError();

    const divError = document.createElement('div');
    divError.id = 'error';
    divError.textContent = err;
    divError.style.padding = '1em';
    divError.style.marginBottom = '0.5em';
    divError.style.backgroundColor = 'red';
    divError.style.width = 'fit-content';

    householdForm.insertBefore(
      divError,
      householdForm.firstChild
    );
  }

  const editHouseholdItem = (id, item) => {
    console.log('editHouseholdItem ', id, item);
  }

  const handle = () => {
    document.getElementById('age').addEventListener('input', e => cleanError());

    document.getElementById('rel').addEventListener('change', e => cleanError());

    householdForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submission ', e);

      this.reset();
    });

    document.querySelector('button.add').addEventListener('click', function(e) {
      e.preventDefault();

      const age = +document.getElementById('age').value; // parseInt
      const relationship = document.getElementById('rel').value;
      const smoker = document.getElementById('smoker').checked;

      if (age === undefined || age <= 0) {
        displayError('Age must be higher than 0');
        return false;
      }

      if (!relationship) {
        displayError('Relationship must be selected');
        return false;
      }

      const item = new HouseholdItem(age, relationship, smoker);
      eventAggregator.publish('household.item.added', item);

      householdForm.reset();
    });
  }

  const init = () => {
    eventAggregator.subscribe('household.item.edit', editHouseholdItem);
    handle();
  }

  return {
    init,
  }
})();

const init = () => {
  listHousehold.init();
  addHouseholdItemForm.init();
}

init();
