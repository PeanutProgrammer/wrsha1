

class Civillian {
    constructor(name, join_date, department, nationalID, telephone_number, address, dob, in_unit) {
        this._name = name;
        this._join_date = join_date;
        this._department = department;
        this._nationalID = nationalID;
        this._telephone_number = telephone_number;
        this._address = address;
        this._dob = dob;
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

    getNationalID = () => {
        return this._nationalID;
    }


    getInUnit = () => {
        return this._in_unit;
    }

    getTelephoneNumber = () => {
        return this._telephone_number;
    }


    getAddress = () => {
        return this._address;
    }

    getDOB = () => {
        return this._dob;
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

    setNationalID = (nationalID) => {
        this._nationalID = nationalID;
    }

    setInUnit = (in_unit) => {
        this._in_unit = in_unit;
    }

    setTelephoneNumber = (telephone_number) => {
        this._telephone_number = telephone_number;
    }

    setAddress = (address) => {
        this._address = address;
    }

    setDOB = (dob) => {
        this._dob = dob;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = Civillian;