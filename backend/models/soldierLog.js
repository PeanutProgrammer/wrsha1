

class SoldierLog {
    constructor(event_type, event_time, soldierID, leaveTypeID, notes, loggerID) {
        this._event_type = event_type;
        this._event_time = event_time;
        this._soldierID = soldierID;
        this._leaveTypeID = leaveTypeID;
        this._notes = notes;
        this._loggerID = loggerID;
    }

    getEventType = () => {
        return this._event_type;
    }

    getEventTime = () => {
        return this._event_time;
    }

    getSoldierID = () => {
        return this._soldierID;
    }

    getLeaveTypeID = () => {
        return this._leaveTypeID;
    }

    getNotes = () => {
        return this._notes;
    }

    getLoggerID = () => {
        return this._loggerID;
    }


    setEventType = (event_type) => {
        this._event_type = event_type;
    }

    setEventTime = (event_time) => {
        this._event_time = event_time;
    }

    setSoldierID = (soldierID) => {
        this._soldierID = soldierID;
    }

    setLeaveTypeID = (leaveTypeID) => {
        this._leaveTypeID = leaveTypeID;
    }

    setNotes = (notes) => {
        this._notes = notes;
    }

    setLoggerID = (loggerID) => {
        this._loggerID = loggerID;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = SoldierLog;