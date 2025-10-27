

class Soldier {
    constructor(name, join_date, end_date, department, mil_id, rank, telephone_number, guardian_name, guardian_telephone_number, in_unit) {
        this._name = name;
        this._join_date = join_date;
        this._end_date = end_date;
        this._department = department;
        this._mil_id = mil_id;
        this._rank = rank;
        this._telephone_number = telephone_number;
        this._guardian_name = guardian_name;
        this._guardian_telephone_number = guardian_telephone_number;
        this._in_unit = in_unit || true;
    }

    getName = () => {
        return this._name;
    }

    getJoinDate = () => {
        return this._join_date;
    }

    getEndDate = () => {
        return this._end_date;
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


    getTelephoneNumber = () => {
        return this._telephone_number;
    }

    getGuardianName = () => {
        return this._guardian_name;
    }


    getGuardianTelephoneNumber = () => {
        return this._guardian_telephone_number;
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

    setEndDate = (join_date) => {
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


    setTelephoneNumber = (telephone_number) => {
        this._telephone_number = telephone_number;
    }


    setGuardianName = (guardian_name) => {
        this._guardian_name = guardian_name;
    }


    setGuardianTelephoneNumber = (guardian_telephone_number) => {
        this._guardian_telephone_number = guardian_telephone_number;
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