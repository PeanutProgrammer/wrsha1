

class NCOLog {
    constructor(event_type, event_time, ncoID, leaveTypeID, notes, loggerID) {
        this._event_type = event_type;
        this._event_time = event_time;
        this._ncoID = ncoID;
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

    getNcoID = () => {
        return this._ncoID;
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

    setNcoID = (ncoID) => {
        this._ncoID = ncoID;
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


module.exports = NCOLog;