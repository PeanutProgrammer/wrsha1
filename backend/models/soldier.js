

class Soldier {
    constructor(name, join_date, department, mil_id, rank, in_unit) {
        this._name = name;
        this._join_date = join_date;
        this._department = department;
        this._mil_id = mil_id;
        this._rank = rank;
        this._in_unit = in_unit || true;
    }

    getName = () => {
        return this._name;
    }

    getJoinDate = () => {
        return this._join_date;
    }

    getDepartment = () => {
        return this._department;
    }

    getMilID = () => {
        return this._mil_id;
    }

    getRank = () => {
        return this._rank;
    }

    getInUnit = () => {
        return this._in_unit;
    }


    setName = (name) => {
        this._name = name;
    }

    setJoinDate = (join_date) => {
        this._join_date = join_date;
    }

    setDepartment = (department) => {
        this._department = department;
    }

    setMilID = (mil_id) => {
        this._mil_id = mil_id;
    }

    setRank = (rank) => {
        this._rank = rank;
    }

    setInUnit = (in_unit) => {
        this._in_unit = in_unit;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = Soldier;