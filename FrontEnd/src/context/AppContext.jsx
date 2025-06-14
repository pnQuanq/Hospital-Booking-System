import { createContext } from "react";
import { doctors } from "../assets/assets";

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const calculateAge = (dob) => {
        const today = new Date()
        const birthDay = new Date(dob)

        let age = today.getFullYear() - birthDay.getFullYear()

        return age
    }
    
    const currencySymbol = '$'

    const value = {
        doctors, 
        currencySymbol,
        calculateAge
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider