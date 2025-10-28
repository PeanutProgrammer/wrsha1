

class Guest {
    constructor(id ,name, visit_start, visit_end, visit_to, reason) {
        this._id = id;
        this._name = name;
        this._visit_start = visit_start;
        this._visit_end = visit_end;
        this._visit_to = visit_to;
        this._reason = reason;
    }

    getId = () => {
        return this._id;
    }

    getName = () => {
        return this._name;
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

    setName = (name) => {
        this._name = name;
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