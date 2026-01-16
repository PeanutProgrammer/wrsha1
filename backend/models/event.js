class Event {
  constructor(name, date, description, location) {
    this._name = name;
    this._date = date;
    this._description = description;
    this._location = location;
  }

  getName = () => {
    return this._name;
  };
    
    getDate = () => {
    return this._date;
    }
    
    getDescription = () => {
    return this._description;
    }
    
    getLocation = () => {
    return this._location;
    }

  setName = (name) => {
    this._name = name;
  };
    setDate = (date) => {
    this._date = date;
    }
    
    setDescription = (description) => {
    this._description = description;
    }
    
    setLocation = (location) => {
    this._location = location;
    }

  toJSON() {
    const { ...json } = this;
    return json;
  }
}

module.exports = Event;
