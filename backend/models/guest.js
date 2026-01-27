

class Guest {
    constructor(id, rank,name, unit,visit_start, visit_end, visit_to, reason) {
        this._id = id;  // This should be the ID, but you're passing 'name' as the first parameter.
        this._rank = rank;
        this._name = name;
        this._unit = unit;
        this._visit_start = visit_start;
        this._visit_end = visit_end;
        this._visit_to = visit_to;
        this._reason = reason;
    }



    getId = () => {
        return this._id;
    }
    getRank = () => {
        return this._rank;
    }

    getName = () => {
        return this._name;
    }

    getUnit = () => {
        return this._unit;
    }

    getVisitStart = () => {
        return this._visit_start;
    }

    getVisitEnd = () => {
        return this._visit_end;
    }

    getVisitTo = () => {
        return this._visit_to;
    }

    getReason = () => {
        return this._reason;
    }

    setId = (id) => {
        this._id = id;
    }

    setRank = (rank) => {
        this._rank = rank;
    }

    setName = (name) => {
        this._name = name;
    }

    setUnit = (unit) => {
        this._unit = unit;
    }

    setVisitStart = (visit_start) => {
        this._visit_start = visit_start;
    }

    setVisitEnd = (visit_end) => {
        this._visit_end = visit_end;
    }

    setVisitTo = (visit_to) => {
        this._visit_to = visit_to;
    }

    setReason = (reason) => {
        this._reason = reason;
    }

    toJSON() {
        const { ...json } = this;
        return json;
      } 
}



module.exports = Guest;