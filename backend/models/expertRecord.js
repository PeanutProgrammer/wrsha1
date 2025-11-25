

class ExpertRecord {
    constructor(start_date, end_date, expertID, officerID, external_officer, loggerID, notes) {
        this._start_date = start_date;
        this._end_date = end_date;
        this._expertID = expertID;
        this._officerID = officerID;
        this._external_officer = external_officer;
        this._loggerID = loggerID;
        this._notes = notes;
    }

    getStartDate = () => {
        return this._start_date;
    }


    getEndDate = () => {
        return this._end_date;
    }


    getExpertID = () => {
        return this._expertID;
    }


    getOfficerID = () => {
        return this._officerID;
    }

    getExternalOfficer = () => {
        return this._external_officer
    }


    getLoggerID = () => {
        return this._loggerID;
    }

    getNotes = () => {
        return this._notes;
    }


    setStartDate = (start_date) => {
        this._start_date = start_date;
    }


    setEndDate = (end_date) => {
        this._end_date = end_date;
    }


    setExpertID = (expertID) => {
        this._expertID = expertID;
    }


    setOfficerID = (officerID) => {
        this._officerID = officerID;
    }

    setExternalOfficer = (external_officer) => {
        this._external_officer = external_officer;
    }

    setLoggerID = (loggerID) => {
        this._loggerID = loggerID;
    }

    setNotes = (notes) => {
        this._notes = notes;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = ExpertRecord;