

class ExpertRecord {
    constructor(start_date, end_date, expertID, department_visited) {
        this._start_date = start_date;
        this._end_date = end_date;
        this._expertID = expertID;
        this._department_visited = department_visited;
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



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = ExpertRecord;