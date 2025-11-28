class Delegate {
  constructor(id, rank, name, unit, visit_start, visit_end, notes) {
      this._id = id; 
      this._rank = rank;
      this._name = name;
      this._unit = unit;
      this._visit_start = visit_start;
      this._visit_end = visit_end;
      this._notes = notes;
  }
 

  getId = () => {
    return this._id;
  };
    
  getRank = () => {
    return this._rank;
  }

  getName = () => {
    return this._name;
  };

  getVisitStart = () => {
    return this._visit_start;
  };

  getVisitEnd = () => {
    return this._visit_end;
  };
    
    getUnit = () => {
    return this._unit;
  }

 getNotes = () => {
    return this._notes;
  };


  setId = (id) => {
    this._id = id;
  };

  setRank = (rank) => {
    this._rank = rank;
  };

  setName = (name) => {
    this._name = name;
  };

  setVisitStart = (visit_start) => {
    this._visit_start = visit_start;
  };

  setVisitEnd = (visit_end) => {
    this._visit_end = visit_end;
  };
    
    setUnit = (unit) => {
    this._unit = unit;
  }

    setNotes = (notes) => {
    this._notes = notes;
  };

  toJSON() {
    const { ...json } = this;
    return json;
  }
}

module.exports = Delegate;
