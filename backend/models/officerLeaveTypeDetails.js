

class OfficerLeaveTypeDetails {
  constructor(leaveTypeID, start_date, end_date, destination) {
    this._leaveTypeID = leaveTypeID;
    this._start_date = start_date;
    this._end_date = end_date;
    this._destination = destination;
  }

  getLeaveTypeID = () => {
    return this._leaveTypeID;
  };

  getStartDate = () => {
    return this._start_date;
  };

  getEndDate = () => {
    return this.end_date;
  };

  getDestination = () => {
    return this._destination;
  };

  setLeaveTypeID = (leaveTypeID) => {
    this._leaveTypeID = leaveTypeID;
  };

  setStartDate = (start_date) => {
    this._start_date = start_date;
  };

  setEndDate = (end_date) => {
    this._end_date = end_date;
  };

  setDestination = (destination) => {
    this._destination = destination;
  };

  toJSON() {
    const { ...json } = this;
    return json;
  }
}


module.exports = OfficerLeaveTypeDetails;