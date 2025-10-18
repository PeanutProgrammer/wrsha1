

class OfficerLeaveTypeDetails {
    constructor(start_date, end_date, destination) {
        this._start_date = start_date;
        this._end_date = end_date
        this._destination = destination
    }

    getStartDate = () => {
        return this._start_date;
    }

    getEndDate = () => {
        return this.end_date;
    }

    getDestination = () => {
        return this._destination;
    }

    setStartDate = (start_date) => {
        this._start_date = start_date;
    }

    setEndDate = (end_date) => {
        this._end_date = end_date;
    }

    setDestination = (destination) => {
        this._destination = destination;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = OfficerLeaveTypeDetails;