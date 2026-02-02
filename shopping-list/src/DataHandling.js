import Axios from 'axios'

export const addToList = (item) => {
    return Axios.post("https://svac-shopping-list.herokuapp.com/insert", {
        itemName: item.itemName,
        quantity: item.quantity,
        units: item.units,
        isToGet: item.isToGet
    })
}

export const updateItem = (updatedItem) => {
    return Axios.put("https://svac-shopping-list.herokuapp.com/update", {
        id: updatedItem._id,
        ...updatedItem
    })
}

export const adjustItemQuantity = (id, newQuantity) => {
    return Axios.put("https://svac-shopping-list.herokuapp.com/update", {
        id: id,
        quantity: newQuantity,
    })
}

export const adjustItemIsToGet = (id, newIsToGet) => {
    return Axios.put("https://svac-shopping-list.herokuapp.com/update", {
        id: id,
        isToGet: newIsToGet,
    })
}

export const deleteItem = (id) => {
    return Axios.delete(`https://svac-shopping-list.herokuapp.com/delete/${id}`)
}