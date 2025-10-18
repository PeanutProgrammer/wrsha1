const bcrypt = require("bcrypt");
const { ENUM } = require("mysql/lib/protocol/constants/types");




class User {
    constructor( name,username,token,type,hashedPassword) {
        this._name = name;
        this._username = username;
        this._password = hashedPassword || null;
        this._token = token
        this._type = type; 
    }


    

    getName = () => {
        return this._name;
    }

    getUsername = () => {
        return this._username;
    }

    setName =(name) => {
        this._name = name;
    }


    setPassword = async (password) => {
        this._password = await bcrypt.hash(password, 8);

    }
    checkPassword = async (password) => {

        return bcrypt.compare(password, this._password);

    }

    getPassword = () => {
        return this._password; 
    }

    getToken = () => {
        return this._token;
    }


    getType = () => {
        return this._type; 
    }

    setType = (type) =>{
        this._type = type;
    }


    toJSON() {
        const { _password, ...json } = this;
        return json;
      } 
}



module.exports = User;