

class PastOfficer {
    constructor(name, join_date, mil_id, rank, address, height, weight, dob, seniority_number, end_date, transferID, transferred_to) {
        this._name = name;
        this._join_date = join_date;
        this._mil_id = mil_id;
        this._rank = rank;
        this._address = address;
        this._height = height;
        this._weight = weight;
        this._dob = dob;
        this._seniority_number = seniority_number;
        this._end_date = end_date;
        this._transferID = transferID;
        this._transferred_to = transferred_to;
    }

    getName = () => {
        return this._name;
    }

    getJoinDate = () => {
        return this._join_date;
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


    getSeniorityNumber = () => {
        return this._seniority_number;
    }

    getEndDate = () => {
        return this._end_date;
    }

    getTransferID = () => {
        return this._transferID;
    }

    getTransferredTo = () => {
        return this._transferred_to;
    }





    setName = (name) => {
        this._name = name;
    }

    setJoinDate = (join_date) => {
        this._join_date = join_date;
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


    setSeniorityNumber = (seniority_number) => {
        this._seniority_number = seniority_number;
    }


    setEndDate = (end_date) => {
        this._end_date = end_date;
    }

    setTransferID = (transferID) => {
        this._transferID = transferID;
    }

    setTransferredTo = (transferred_to) => {
        this._transferred_to = transferred_to;
    }




    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = PastOfficer;