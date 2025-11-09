

class NCO {
    constructor(name, join_date, department, mil_id, rank, address, height, weight, dob, in_unit) {
        this._name = name;
        this._join_date = join_date;
        this._department = department;
        this._mil_id = mil_id;
        this._rank = rank;
        this._address = address;
        this._height = height;
        this._weight = weight;
        this._dob = dob;
        this._in_unit = in_unit;
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

    getHeight = () => {
        return this._height;
    }


    getWeight = () => {
        return this._weight;
    }


    getDOB = () => {
        return this._dob;
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

    setAddress = (address) => {
        this._address = address;
    }


    setHeight = (height) => {
        this._height = height;
    }


    setWeight = (weight) => {
        this._weight = weight;
    }


    setDOB = (dob) => {
        this._dob = dob;
    }

    setInUnit = (in_unit) => {
        this._in_unit = in_unit;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = NCO;