

class ExpertRecord {
    constructor(start_date, end_date, expertID, department_visited, loggerID, notes) {
        this._start_date = start_date;
        this._end_date = end_date;
        this._expertID = expertID;
        this._department_visited = department_visited;
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


    getDepartmentVisited = () => {
        return this._department_visited;
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


    setDepartmentVisited = (department_visited) => {
        this._department_visited = department_visited;
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