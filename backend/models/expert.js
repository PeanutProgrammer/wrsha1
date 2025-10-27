

class Expert {
    constructor(nationalID, name, passport_number, security_clearance_num, valid_from, valid_through, company_name ) {
        this._nationalID = nationalID;
        this._name = name;
        this._passport_number = passport_number;
        this._security_clearance_number = security_clearance_num;
        this._valid_from = valid_from;
        this._valid_through = valid_through;
        this._company_name = company_name;
    }

    getNationalID = () => {
        return this._nationalID;
    }

    getName = () => {
        return this._name;
    }

    getPassportNumber = () => {
        return this._passport_number;
    }

    getSecurityClearanceNumber = () => {
        return this._security_clearance_number;
    }

    getValidFrom = () => {
        return this._valid_from;
    }

    getValidThrough = () => {
        return this._valid_through;
    }

    getCompanyName = () => {
        return this._company_name;
    }



    setNationalID = (nationalID) => {
        this._nationalID = nationalID;
    }

     setName = (name) => {
        this._name = name;
    }

     setPassportNumber = (passport_number) => {
        this._passport_number = passport_number;
    }

     setSecurityClearanceNumber = (security_clearance_number) => {
        this._security_clearance_number = security_clearance_number;
    }

     setValidFrom = (valid_from) => {
        this._valid_from = valid_from;
    }

     setValidThrough = (valid_through) => {
        this._valid_through = valid_through;
    }

     setCompanyName = (company_name) => {
        this._company_name = company_name;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = Expert;