

class NCO {
    constructor(name, join_date, department, mil_id, rank, address, dob, in_unit, attached) {
        this._name = name;
        this._join_date = join_date;
        this._department = department;
        this._mil_id = mil_id;
        this._rank = rank;
        this._address = address;
        this._dob = dob;
        this._in_unit = in_unit;
        this._attached = attached;
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

    getAddress = () => {
        return this._address;
    }



    getDOB = () => {
        return this._dob;
    }

    getInUnit = () => {
        return this._in_unit;
    }
    getAttached = () => {
        return this._attached;
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

    setAddress = (address) => {
        this._address = address;
    }


    setDOB = (dob) => {
        this._dob = dob;
    }

    setInUnit = (in_unit) => {
        this._in_unit = in_unit;
    }
    setAttached = (attached) => {
        this._attached = attached;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = NCO;