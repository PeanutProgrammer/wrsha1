

class Department {
    constructor(name) {
        this._name = name;
    }

    getName = () => {
        return this._name;
    }


    setName = (name) => {
        this._name = name;
    }



    toJSON() {
        const { ...json } = this;
        return json;
      } 
}


module.exports = Department;