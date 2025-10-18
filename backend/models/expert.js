

class Expert {
    constructor(nationalID, name, passport_num, security_clearance_num, valid_from, valid_through, company_name ) {
        this._nationalID = nationalID;
        this._name = name;
        this._passport_num = passport_num;
        this._security_clearance_num = security_clearance_num;
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

    getPassportNum = () => {
        return this._passport_num;
    }

    getSecurityClearanceNumber = () => {
        return this._security_clearance_num;
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

     setPassportNum = (passport_num) => {
        this._passport_num = passport_num;
    }

     setSecurityClearanceNum = (security_clearance_num) => {
        this._security_clearance_num = security_clearance_num;
    }

     setValidFrom = (valid_from) => {
        this.valid_from = valid_from;
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