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

  const addedHouseholdItem = (item) => {
    console.log('addedHouseholdItem ', item);
    household.push(item);

    const li = document.createElement('li');
    li.appendChild(document.createTextNode(item.age));
    li.appendChild(document.createTextNode(item.relationship))
    li.appendChild(document.createTextNode(item.smoker));

    ol.appendChild(li);
  }

  const init = () => {
    eventAggregator.subscribe('household.item.added', addedHouseholdItem);
  }

  return {
    init
  }

})();

const addHouseholdItemForm = (() => {

  const clear = () => {
    console.log('reset form');
    document.getElementById('age').value = '';
    document.getElementById('rel').value = '';
    document.getElementById('smoker').checked = false;
  }

  const listener = () => {
    document.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Form submission ', e);

      this.reset();
      clear();
    });

    document.querySelector('button.add').addEventListener('click', function(e) {
      e.preventDefault();

      const age = +document.getElementById('age').value;
      const relationship = document.getElementById('rel').value;
      const smoker = document.getElementById('smoker').checked;

      const item = new HouseholdItem(age, relationship, smoker);
      eventAggregator.publish('household.item.added', item);

      clear();
    })
  }

  const init = () => {
    listener();
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
